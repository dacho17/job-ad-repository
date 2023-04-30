import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { JobAdDTO } from '../helpers/dtos/jobAdDTO';
import { JobAdMapper } from '../helpers/mappers/jobAdMapper';
import { ScrapingJobAdRepository } from '../repositories/scrapingJobAdRepository';
import { ScrapeJobAdsForm }  from './../helpers/dtos/scrapeJobAdsForm';
import IJobAdScraper from './scrapers/interfaces/IJobAdScraper';
import { AdzunaAdScraper } from './scrapers/jobAdScrapers/adzunaAdScraper';
import { ArbeitNowAdScraper } from './scrapers/jobAdScrapers/arbeitNowAdScraper';
import { CareerBuilderScraper } from './scrapers/jobAdScrapers/careerBuilder';
import { CarerJetAdScraper } from './scrapers/jobAdScrapers/careerJetAdScraper';
import { CvLibraryAdScraper } from './scrapers/jobAdScrapers/cvLibraryAdScraper';
import { EuroJobsAdScraper } from './scrapers/jobAdScrapers/euroJobsAdScraper';
import { EuroJobSitesAdScraper } from './scrapers/jobAdScrapers/euroJobSitesAdScraper';
import { GraduatelandAdScraper } from './scrapers/jobAdScrapers/graduatelandAdScraper';
import { JobFluentAdScraper } from './scrapers/jobAdScrapers/jobFluentAdScraper';
import LinkedInAdScraper from './scrapers/jobAdScrapers/linkedinAdScraper';
import { NoFluffAdScraper } from './scrapers/jobAdScrapers/noFluffJobsAdScraper';
import { QreerAdScraper } from './scrapers/jobAdScrapers/qreerAdScraper';
import { SimplyHiredAdScraper } from './scrapers/jobAdScrapers/simplyHiredAdScraper';
import SnaphuntAdScraper from './scrapers/jobAdScrapers/snaphuntScraper';
import { TybaAdScraper } from './scrapers/jobAdScrapers/tybaAdScraper';
import { WeWorkRemotelyAdScraper } from './scrapers/jobAdScrapers/weWorkRemotelyAdScraper';
import { register } from 'ts-node';
import JobAdScrapingTaskRepository from '../repositories/jobAdScrapingTaskRepository';
import DbQueryError from '../helpers/errors/dbQueryError';
register();
import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';
import UserRepository from '../repositories/userRepository';
import { resolve } from 'path';
import JobAdScrapingTaskDTO from '../helpers/dtos/jobAdScrapingTaskDTO';
import JobAdScrapingTaskMapper from '../helpers/mappers/jobAdScrapingTaskMapper';

@Service()
export class ScrapingJobAdService {
    private scrapingJobAdRepository: ScrapingJobAdRepository;
    private userRepository: UserRepository;
    private jobAdScrapingTaskRepository: JobAdScrapingTaskRepository;
    private jobAdMapper: JobAdMapper;
    private jobAdScrapingTaskMapper: JobAdScrapingTaskMapper;

    private adzunaAdScraper: AdzunaAdScraper;
    private arbeitNowAdScraper: ArbeitNowAdScraper;
    private careerJetAdScraper: CarerJetAdScraper;
    private careerBuilderScraper: CareerBuilderScraper;
    private cvLibraryAdScraper: CvLibraryAdScraper;
    private euroJobsAdScraper: EuroJobsAdScraper;
    private euroJobSitesAdScraper: EuroJobSitesAdScraper;
    private graduatelandAdScraper: GraduatelandAdScraper;
    private jobFluentAdScraper: JobFluentAdScraper;
    private linkedinAdScraper: LinkedInAdScraper;
    private noFluffAdScraper: NoFluffAdScraper;
    private qreerAdScraper: QreerAdScraper;
    private simplyHiredAdScraper: SimplyHiredAdScraper;
    private snaphuntAdScraper: SnaphuntAdScraper;
    private tybaAdScraper: TybaAdScraper;
    private weWorkRemotelyAdScraper: WeWorkRemotelyAdScraper;

    constructor(
        @Inject() scrapingJobAdRepository: ScrapingJobAdRepository,
        @Inject() userRepository: UserRepository,
        @Inject() jobAdScrapingTaskRepository: JobAdScrapingTaskRepository,
        @Inject() jobAdMapper: JobAdMapper,
        @Inject() jobAdScrapingTaskMapper: JobAdScrapingTaskMapper,
        @Inject() adzunaAdScraper: AdzunaAdScraper,
        @Inject() arbeitNowAdScraper: ArbeitNowAdScraper,
        @Inject() careerJetAdScraper: CarerJetAdScraper,
        @Inject() careerBuilderScraper: CareerBuilderScraper,
        @Inject() cvLibraryAdScraper: CvLibraryAdScraper,
        @Inject() euroJobsAdScraper: EuroJobsAdScraper,
        @Inject() euroJobSitesAdScraper: EuroJobSitesAdScraper,
        @Inject() graduatelandAdScraper: GraduatelandAdScraper,
        @Inject() jobFluentAdScraper: JobFluentAdScraper,
        @Inject() linkedinAdScraper: LinkedInAdScraper,
        @Inject() noFluffAdScraper: NoFluffAdScraper,
        @Inject() qreerAdScraper: QreerAdScraper,
        @Inject() simplyHiredAdScraper: SimplyHiredAdScraper,
        @Inject() snaphuntAdScraper: SnaphuntAdScraper,
        @Inject() tybaAdScraper: TybaAdScraper,
        @Inject() weWorkRemotelyAdScraper: WeWorkRemotelyAdScraper,
    )
    {
        this.scrapingJobAdRepository = scrapingJobAdRepository;
        this.userRepository = userRepository;
        this.jobAdScrapingTaskRepository = jobAdScrapingTaskRepository;
        this.jobAdMapper = jobAdMapper;
        this.jobAdScrapingTaskMapper = jobAdScrapingTaskMapper;
        this.adzunaAdScraper = adzunaAdScraper;
        this.arbeitNowAdScraper = arbeitNowAdScraper;
        this.careerJetAdScraper = careerJetAdScraper;
        this.careerBuilderScraper = careerBuilderScraper;
        this.cvLibraryAdScraper = cvLibraryAdScraper;
        this.euroJobsAdScraper = euroJobsAdScraper;
        this.euroJobSitesAdScraper = euroJobSitesAdScraper;
        this.graduatelandAdScraper = graduatelandAdScraper;
        this.jobFluentAdScraper = jobFluentAdScraper;
        this.linkedinAdScraper = linkedinAdScraper;
        this.noFluffAdScraper = noFluffAdScraper;
        this.qreerAdScraper = qreerAdScraper;
        this.simplyHiredAdScraper = simplyHiredAdScraper;
        this.snaphuntAdScraper = snaphuntAdScraper;
        this.tybaAdScraper = tybaAdScraper;
        this.weWorkRemotelyAdScraper = weWorkRemotelyAdScraper;
    }

    /**
   * @description Function accepts client form, and based on the data provided scrapes jobs across the jobsites defined in the getScrapers() function.
   * The function immediately returns the response on whether the jobAdScrapingTask has beeen started.
   * The task is delegated to a separate thread which runs it in the background.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<JobAdScrapingTaskDTO>}
   */
    public async scrapeJobAdsOnAllWebsites(clientForm: ScrapeJobAdsForm, initiatorJWT: string): Promise<JobAdScrapingTaskDTO> {
        let jobAdScrapingTask;
        let user;
        try {
            user = await this.userRepository.getByJWT(initiatorJWT);
            if (!user) {
                throw new DbQueryError(`The user with jwt=${initiatorJWT} has not been found`);
            }
            console.log(`fetched user with id=${user.id}`);

            const scrapeParams = JSON.stringify(clientForm);

            jobAdScrapingTask = await this.jobAdScrapingTaskRepository.createWithParams(scrapeParams, user.id);
            if (!jobAdScrapingTask) {
                throw new DbQueryError(`The task value after creation is null!`);
            }
        } catch (err) {
            console.log(`JobAdScrapingTask was not successfully created. -[${err}]`);
            throw new DbQueryError('Task was not started successfully. Please try again');
        }

        const jobAdScrapingTaskId = jobAdScrapingTask.id!.valueOf();
        // delegating jobAd scraping work to a worker thread
        this.runJobAdScrapingWorker(clientForm, jobAdScrapingTaskId, user.id);

        return this.jobAdScrapingTaskMapper.toDTO(jobAdScrapingTask);
    }

    /**
   * @description Function accepts client form, and a scraper. Based on the two, it will start scraping jobs from the website determined by the provided scraper.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAds(clientForm: ScrapeJobAdsForm, scraper: IJobAdScraper): Promise<number> {
        let scrapedJobAds;
        try {
            scrapedJobAds = await scraper.scrape(clientForm);
        } catch (err) {
            console.log(`An error occurred while attempting to scrape the job ads from a site [${err}]`);
            return 0;
        }

        console.log(scrapedJobAds.length + ' ads have been scraped.');

        if (scrapedJobAds?.length == 0) {
            return 0;
        }

        try {
            const numberOfStoredAds = await this.storeJobAds(scrapedJobAds);
            console.log(`${numberOfStoredAds} ads have been stored in scrapeJobAds`);
            return numberOfStoredAds;
        } catch (err) {
            console.log(`An error has occurred in scrapeJobAds while attempting to store the scraped jobAds to the database. - [${err}]`);
            return 0;
        }
    }

     /**
   * @description Function returns the list of offseted jobAdScrapingTasks for the given user.
   * @param {number} offset
   * @param {string} initiatorJWT
   * @returns {Promise<JobAdScrapingTaskDTO[] | null>}
   */
    public async getJobAdScrapingTasks(offset: number, initiatorJWT: string): Promise<JobAdScrapingTaskDTO[] | null> {
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
            tasks = await this.jobAdScrapingTaskRepository.getJobAdScrapingTasksForUser(user.id, offset);
        } catch (err) {
            console.log(`An error occurred while fetching jobAdScraping tasks for user with id=${user.id}. -[${err}]`);
            throw new DbQueryError('An error occurred while fetching the data');
        }

        const taskDTOs = tasks!.map(task => this.jobAdScrapingTaskMapper.toDTO(task));
        return taskDTOs;
    }

     /**
   * @description Function returns the list of implemented jobAd scrapers.
   * @returns {IJobAdScraper[]}
   */
    public getScrapers(): IJobAdScraper[] {
        return [
            this.adzunaAdScraper, this.arbeitNowAdScraper, this.careerBuilderScraper, this.careerJetAdScraper, this.cvLibraryAdScraper,
            this.euroJobsAdScraper, this.euroJobSitesAdScraper, this.graduatelandAdScraper, this.jobFluentAdScraper, 
            this.linkedinAdScraper, this.noFluffAdScraper,
            this.qreerAdScraper, this.simplyHiredAdScraper, this.snaphuntAdScraper, this.tybaAdScraper, this.weWorkRemotelyAdScraper
        ];
    }

    /**
   * @description Function maps jobAd DTOs to MAP objects and passes them to the repository to be stored.
   * @param jobAds JobAdDTO[] List of JobAd DTO objects
   * @returns {Promise<number>} Promise resolving to the number of stored entries
   */
    private async storeJobAds(jobAds: JobAdDTO[]): Promise<number> {
        // const jobAdsMAP = jobAds.map(jobAd => this.jobAdMapper.toMap(jobAd));
        
        const res = await this.scrapingJobAdRepository.createMany(jobAds);  // NOTE: I am passing DTOs to the function!
        return res.length;
    }

    /**
   * @description Function maps jobAd DTO to its MAP object and passes it to the repository to be stored.
   * @param jobAd JobAdDTO A JobAd DTO object
   * @returns {Promise<boolean>} Promise resolving to the boolean depending on whether the entry was stored successfully. 
   */
    private async storeJobAd(jobAd: JobAdDTO): Promise<boolean> {
        const jobAdMAP = this.jobAdMapper.toMap(jobAd);

        const res = await this.scrapingJobAdRepository.create(jobAdMAP);
        return !!res;
    }

    /**
   * @description Function which runs a jobAdScrapingWorker script.
   * @param {ScrapeJobAdsForm} clientForm
   * @param {number} jobAdScrapeTaskId
   * @param {number} userId
   * @returns {void}
   */
    private runJobAdScrapingWorker(clientForm: ScrapeJobAdsForm, jobAdScrapeTaskId: number, userId: number): void {
        if (isMainThread) {
            const worker = new Worker(resolve(__dirname, '../helpers/backgroundWorkers/jobAdScrapingWorker'), {
                workerData: {
                    // clientForm: clientForm, attempting to deconstruct the complex object
                    jobTitle: clientForm.jobTitle,
                    location: clientForm.location,
                    reqNumberOfAds: clientForm.reqNOfAds,
                    isRemote: clientForm.scrapeOnlyRemote,
                    jobAdScrapingTaskId: jobAdScrapeTaskId,
                    taskInitiatorId: userId
                }
            });
            // worker.on('message', (val) => {  main thread can listen to messages sent by the child thread
            //     console.log(`On: ${val}`)
            // });
        }
    }
}
