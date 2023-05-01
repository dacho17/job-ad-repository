import { resolve } from "path";
import { Inject, Service } from "typedi";
import { isMainThread, Worker } from "worker_threads";
import { Job } from "../database/models/job";
import { GetJobsRequest } from '../helpers/dtos/getJobsRequest';
import JobDTO from '../helpers/dtos/jobDTO';
import JobScrapingTaskDTO from "../helpers/dtos/jobScrapingTaskDTO";
import { JobAdSource } from "../helpers/enums/jobAdSource";
import DbQueryError from "../helpers/errors/dbQueryError";
import PuppeteerError from "../helpers/errors/puppeteerError";
import ScrapeError from "../helpers/errors/scrapeError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
import JobMapper from "../helpers/mappers/jobMapper";
import JobScrapingTaskMapper from "../helpers/mappers/jobScrapingTaskMapper";
import OrganizationMappper from "../helpers/mappers/organizationMapper";
import Utils from "../helpers/utils";
import JobScrapingTaskRepository from "../repositories/jobScrapingTaskRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import UserRepository from "../repositories/userRepository";
import BrowserAPI from "./browserAPI";
import IJobApiScraper from './scrapers/interfaces/IJobApiScraper';
import IJobBrowserScraper from './scrapers/interfaces/IJobBrowserScraper';
import JobScraperHelper from "./scrapers/jobScraperHelper";

@Service()
export class ScrapingJobService {
    private jobRepository: ScrapingJobRepository;
    private userRepository: UserRepository;
    private jobScrapingTaskRepository: JobScrapingTaskRepository;

    private jobScraperHelper: JobScraperHelper;
    private jobMapper: JobMapper;
    private jobScrapingTaskMapper: JobScrapingTaskMapper; 
    private organizationMapper: OrganizationMappper;
    private browserAPI: BrowserAPI;
    private utils: Utils;

    constructor(
        @Inject() jobRepository: ScrapingJobRepository,
        @Inject() userRepository: UserRepository,
        @Inject() jobScrapingTaskRepository: JobScrapingTaskRepository,
        @Inject() jobScraperHelper: JobScraperHelper,
        @Inject() jobMapper: JobMapper,
        @Inject() jobScrapingTaskMapper: JobScrapingTaskMapper,
        @Inject() organizationMapper: OrganizationMappper,
        @Inject() broserAPI: BrowserAPI,
        @Inject() utils: Utils,
    )
    {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobScrapingTaskRepository = jobScrapingTaskRepository;
        this.jobScraperHelper = jobScraperHelper;
        this.jobMapper = jobMapper;
        this.jobScrapingTaskMapper = jobScrapingTaskMapper;
        this.organizationMapper = organizationMapper;
        this.browserAPI = broserAPI;
        this.utils = utils;
    }

    /**
   * @description Function creates a jobScrapingTask, and delegates it a worker thread to be executed asynchronously 
   * in the background.
   * The worker thread detects job ads for which jobs have not been scraped. For each ad it calls a scrape function.
   * Job data is then scraped and stored into the database connected to the Job Ads. Job Ads are then marked as scraped.
   * @param {string} userJWT
   * @returns {Promise<JobScrapingTaskDTO>}
   */
    public async scrapeJobs(userJWT: string): Promise<JobScrapingTaskDTO> {
        let user, jobScrapingTask;
        try {
            user = await this.userRepository.getByJWT(userJWT);
            if (!user) {
                console.log(`Unsuccessful in attempt of fetching the user with jwt=${userJWT}}`);
                throw new UnrecognizedDataError('Unsuccessful in creating a jobScrapingTask');
            }

            jobScrapingTask = await this.jobScrapingTaskRepository.create(user.id);
            if (!jobScrapingTask) {
                console.log(`Job scraping task connected to the user id=${user.id} has not been successfully created.`);
                throw new DbQueryError('An error occurred in attempt to run a task');
            }
        } catch (err) {
            if (err instanceof DbQueryError || err instanceof UnrecognizedDataError) {
                throw err;
            }
            console.log(`An error occurred in scrapeJobs - [${err}]`);
            throw new DbQueryError('Unsuccessful in creating a jobScrapingTask');
        }

        const jobScrapingTaskId = jobScrapingTask.id!.valueOf();
        // delegating job scraping work to a worker thread
        this.runJobScrapingWorker(jobScrapingTaskId, user.id);

        return this.jobScrapingTaskMapper.toDTO(jobScrapingTask);
    }

    public async scrapeAndFetchJobFromUrl(url: string): Promise<JobDTO | null> {
        const scrapedJob = await this.scrapeJobFromUrl(url);

        return scrapedJob ? this.jobMapper.toDTO(scrapedJob) : null;
    }

    /**
   * @description Function accepts url from which a Job is to be scraped.
   * Job data is then scraped, along with the organization data, and they are stored into the Job and Organization table respectively.
   * @returns {Promise<JobDTO>} Promise resolving to JobDTO having connected OrganizationDTO as one of the properties.
   */
    public async scrapeJobFromUrl(url: string): Promise<Job | null> {
        await this.browserAPI.run();
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const scraper = this.jobScraperHelper.getScraperFor(jobSource);
        if (!scraper) {
            console.log(`Scraper not found for the provided url=${url}`);
            throw new UnrecognizedDataError(`The provided url could not be processed by the application.`);
        }
        let newJobDTO;
        // differentiating between IJobBrowserScrapers and IJobApiScrapers
        try {
            if (jobSource !== JobAdSource.SNAPHUNT) {
                try {
                    await this.browserAPI.openPage(url);
                } catch (err) {
                    const receivedStatusCode = this.browserAPI.getResponseCode();
                    console.log(`Error occured while openning the page url=${url}. Status code received=${receivedStatusCode} - [${err}]`)
                    throw new PuppeteerError(`Error occured while attempting to open the page.`, receivedStatusCode!);
                }
                newJobDTO = await (scraper as IJobBrowserScraper).scrape(null, this.browserAPI);
            } else {
                newJobDTO = await (scraper as IJobApiScraper).scrape(null, url);                    
            }
        } catch (err) {
            if (err instanceof PuppeteerError) {
                throw err;
            } else {
                console.log(`An error occurred while trying to scrape job from url=${url} - [${err}]`);
                throw new ScrapeError('An error occurred while processing the data from the provided url.');
            }
        }

        if (!newJobDTO) return null;    // jobUnavailable
        const newJobMAP = this.jobScraperHelper.buildJobMap(newJobDTO!, url);
        newJobMAP.organization = this.organizationMapper.toMap(newJobDTO!.organization);
        // const newOrgMAP = this.organizationMapper.toMap(newJobDTO.organization);

        const storedJobMAP = await this.jobScraperHelper.sendScrapedJobForStoring(newJobMAP);
        if (!storedJobMAP) {
            throw new DbQueryError(`An error occurred while trying to store a job scraped from url=${url}`);
        }

        return storedJobMAP;
    }

    /**
   * @description Function fetches jobs from jobRepository given limit, offset and searchWord.
   * @param {GetJobsRequest} getJobsReq
   * @returns {Promise<JobDTO[]>} Promise resolving to the jobDTO list
   */
    public async getJobsPaginated(getJobsReq: GetJobsRequest): Promise<JobDTO[]> {
        try {                
            const jobs = await this.jobRepository.getJobsPaginated(getJobsReq);
            const jobDtos = jobs.map(jobMAP => this.jobMapper.toDTO(jobMAP));
            return jobDtos;
        } catch (err) {
            console.log(`An error occured in getJobsPaginated - [${err}]`);
            throw new DbQueryError(`An error occured while trying to fetch jobs`);
        }
    }

    /**
   * @description Function fetches the job matching jobId from jobRepository.
   * @param {number} jobId
   * @returns {Promise<JobDTO>} Promise resolving to the jobDTO
   */
    public async getJobById(jobId: number): Promise<JobDTO> {
        try {
            const job = await this.jobRepository.getById(jobId);
            if (job) {
                const jobDto = this.jobMapper.toDTO(job);
                return jobDto;    
            }
            console.log(`Job with jobId=${jobId} has not been found`);
            throw new UnrecognizedDataError('Job could not be fetched');
        } catch (err) {
            console.log(`An error occured in getJobById. JobId=${jobId} - [${err}]`);
            throw new DbQueryError(`An error occured while tryi.ng to fetch jobs`);
        }
    }

    /**
   * @description Function returns the list of offseted jobScrapingTasks for the given user.
   * @param {number} offset
   * @param {string} initiatorJWT
   * @returns {Promise<JobScrapingTaskDTO[] | null>}
   */
    public async getJobScrapingTasks(offset: number, initiatorJWT: string): Promise<JobScrapingTaskDTO[] | null> {
        let user;
        try {
            user = await this.userRepository.getByJWT(initiatorJWT);
            if (!user) {
                throw new DbQueryError(`The user with jwt=${initiatorJWT} has not been found`);
            }
        } catch (err) {
            console.log(`An error occurred while attempting to retrieve user with jwt=${initiatorJWT} from the database. - [${err}]`);
            throw new DbQueryError('An error occured while fetching the data');
        }

        let tasks;
        try {
            tasks = await this.jobScrapingTaskRepository.getJobScrapingTasksForUser(user.id, offset);
        } catch (err) {
            console.log(`An error occurred while fetching jobScraping tasks for user with id=${user.id}. -[${err}]`);
            throw new DbQueryError('An error occurred while fetching the data');
        }

        const taskDTOs = tasks!.map(task => this.jobScrapingTaskMapper.toDTO(task));
        return taskDTOs;
    }

    private runJobScrapingWorker(jobScrapingTaskId: number, userId: number): void {
        if (isMainThread) {
            const worker = new Worker(resolve(__dirname, '../helpers/backgroundWorkers/jobScrapingWorker'), {
                workerData: {
                    jobScrapingTaskId: jobScrapingTaskId,
                }
            });
            worker.on('message', async (val) => {
                if (val.has('terminationMsg')) {
                    console.log('Terminating the worker on WORKER_OPRATION_TERMINATED');
                    worker.terminate();
                }
                console.log(val);
                try {
                    await this.jobScrapingTaskRepository.markAsTerminated(jobScrapingTaskId, val.successfullyStored, val.unsuccessfullyStored);
                } catch (err) {
                    console.log(`An errror occurred while attempting to mark the jobScraping task [id=${jobScrapingTaskId}] as TERMINATED.`);
                }
            });
        }
    }
}
