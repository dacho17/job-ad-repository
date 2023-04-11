import { QueryError } from "sequelize";
import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { Organization } from "../database/models/organization";
import constants from "../helpers/constants";
import { GetJobsRequest } from '../helpers/dtos/getJobsRequest';
import JobDTO from '../helpers/dtos/jobDTO';
import { JobAdSource } from "../helpers/enums/jobAdSource";
import DbQueryError from "../helpers/errors/dbQueryError";
import PuppeteerError from "../helpers/errors/puppeteerError";
import ScrapeError from "../helpers/errors/scrapeError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
import { JobAdMapper } from "../helpers/mappers/jobAdMapper";
import JobMapper from "../helpers/mappers/jobMapper";
import OrganizationMappper from "../helpers/mappers/organizationMapper";
import Utils from "../helpers/utils";
import OrganizationRepository from "../repositories/organizationRepository";
import { ScrapingJobAdRepository } from "../repositories/scrapingJobAdRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import BrowserAPI from "./browserAPI";
import JobParserHelper from "./jobParserHelper";
import IJobApiScraper from './scrapers/interfaces/IJobApiScraper';
import IJobBrowserScraper from './scrapers/interfaces/IJobBrowserScraper';
import IJobScraper from "./scrapers/interfaces/IJobScraper";
import JobScraperHelper from "./scrapers/jobScraperHelper";

@Service()
export class ScrapingJobService {
    private jobAdRepository: ScrapingJobAdRepository;
    private jobRepository: ScrapingJobRepository;
    private organizationRepository: OrganizationRepository;

    private jobScraperHelper: JobScraperHelper;
    private jobAdMapper: JobAdMapper;
    private jobMapper: JobMapper;
    private organizationMapper: OrganizationMappper;
    private browserAPI: BrowserAPI;
    private jobParserHelper: JobParserHelper;
    private utils: Utils;

    constructor(
        @Inject() jobAdRepository: ScrapingJobAdRepository,
        @Inject() jobRepository: ScrapingJobRepository,
        @Inject() organizationRepository: OrganizationRepository,
        @Inject() jobScraperHelper: JobScraperHelper,
        @Inject() jobAdMapper: JobAdMapper,
        @Inject() jobMapper: JobMapper,
        @Inject() organizationMapper: OrganizationMappper,
        @Inject() broserAPI: BrowserAPI,
        @Inject() jobParserHelper: JobParserHelper,
        @Inject() utils: Utils,
    )
    {
        this.jobAdRepository = jobAdRepository;
        this.jobRepository = jobRepository;
        this.organizationRepository = organizationRepository;
        this.jobScraperHelper = jobScraperHelper;
        this.jobAdMapper = jobAdMapper;
        this.jobMapper = jobMapper;
        this.organizationMapper = organizationMapper;
        this.browserAPI = broserAPI;
        this.jobParserHelper = jobParserHelper;
        this.utils = utils;
    }

    /**
   * @description Function detects job ads for which jobs have not been scraped. For each ad it calls a scrape function.
   * Job data is then scraped and stored into the database connected to the Job Ads. Job Ads are then marked as scraped.
   * @returns {Promise<[number, number]>} Promise resolving to the tuple containing
   * number of successfully and unsuccessfully stored jobs.
   */
    public async scrapeJobs(): Promise<[number, number]> {
        let jobAdQueryOffset = 0;
        let expired = 0;
        let succStored = 0;
        await this.browserAPI.run();
        for (;;) {
            let jobAdsWithoutScrapedJobs;
            try {
                jobAdsWithoutScrapedJobs = await this.jobAdRepository.getAdsWithUnscrapedJobs(jobAdQueryOffset);
            } catch (exception) {
                console.error(`getAdsWithoutScrapedDetails unsuccessful - [${exception}]`);
                throw new DbQueryError(`The jobs to be scraped could not be fetched.`);
            }
            if (jobAdsWithoutScrapedJobs.length === 0) break;

            console.log(`${jobAdsWithoutScrapedJobs.length} jobads to be scraped`);
            for (let i = 0; i < jobAdsWithoutScrapedJobs.length; i++) {
                // const jobAdDTO = this.jobAdMapper.toDto(jobAdsWithoutScrapedJobs[i]);
                const jobScraper = this.jobScraperHelper.getScraperFor(jobAdsWithoutScrapedJobs[i].source);
                if (!jobScraper) {
                    jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    continue;
                }
                
                console.log(`${jobAdQueryOffset + succStored + expired}: ${jobAdsWithoutScrapedJobs[i].jobLink} to be scraped`);

                let newJobDTO;
                // differentiating between IJobBrowserScrapers and IJobApiScrapers
                try {
                    if (jobAdsWithoutScrapedJobs[i].source !== JobAdSource.SNAPHUNT) {
                        await this.browserAPI.openPage(jobAdsWithoutScrapedJobs[i].jobLink);
                        if (this.browserAPI.getResponseCode() == 500) {
                            console.log(`The page url=${this.browserAPI.getUrl()} is unavailable at the moment`);
                            jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                            this.browserAPI.resetResponseCode();
                            continue;
                        }
                        this.browserAPI.resetResponseCode();
                        newJobDTO = await (jobScraper as IJobBrowserScraper).scrape(jobAdsWithoutScrapedJobs[i], this.browserAPI);
                    } else {
                        newJobDTO = await (jobScraper as IJobApiScraper).scrape(jobAdsWithoutScrapedJobs[i], jobAdsWithoutScrapedJobs[i].jobLink);                    
                    }
                } catch (exception) {
                    console.log(`Exception occured while scraping job from url${this.browserAPI.getUrl()} - [${exception}]`);
                    jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    continue;
                }

                if (!newJobDTO) {   // handle newJobDTO = null (job is no longer present online)
                    const responseCode = this.browserAPI.getResponseCode()?.toString();
                    console.log(`Job unavailable to be scraped. ${responseCode} HTTP code received from ${this.browserAPI.getUrl()}`);
                    if (responseCode?.startsWith(constants.THREE.toString()) || responseCode === constants.HTTP_NOT_FOUND.toString()) {
                        expired += 1;
                        try {
                            await this.jobAdRepository.updateAsExpired(jobAdsWithoutScrapedJobs[i]) // stores jobAd marking it as expired
                        } catch (err) {
                            console.log(`Error occurred while attempting to update jobAd id=${jobAdsWithoutScrapedJobs[i].id} as expired - [${err}]`);
                            jobAdQueryOffset += 1;
                        }
                    } else if (responseCode?.startsWith(constants.FIVE.toString())) {
                        jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    }
                    continue;
                }

                let newJobMAP = this.buildJobMap(newJobDTO, jobAdsWithoutScrapedJobs[i].jobLink);  // FK should already be set -> newJobMAP.jobAdId = jobAdsWithoutScrapedJobs[i].id; // setting a FK-jobAdId
                newJobMAP.jobAd = this.inheritPropsFromJob(jobAdsWithoutScrapedJobs[i], newJobMAP);
                newJobMAP.organization = this.organizationMapper.toMap(newJobDTO.organization);

                let storedJob = await this.sendScrapedJobForStoring(newJobMAP);
                if (storedJob) {
                    succStored += 1;
                } else {
                    jobAdQueryOffset += 1;  // offset is to be added for the entries unsuccessfully stored to the DB
                    console.log(`Scraped job has not been stored successfully.`)
                }
            }
        }

        await this.browserAPI.close();
        return [succStored, jobAdQueryOffset];
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
        const newJobMAP = this.buildJobMap(newJobDTO!, url);
        newJobMAP.organization = this.organizationMapper.toMap(newJobDTO!.organization);
        // const newOrgMAP = this.organizationMapper.toMap(newJobDTO.organization);

        const storedJobMAP = await this.sendScrapedJobForStoring(newJobMAP);
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
   * @description Function which starts a transaction and interacts with jobRepository, organizationRepository, 
   * and jobAdRepository if the newJobAd has been passed as an argument to the function.
   * Within the transaction a new job will be created, along with the company (TODO: if it already does not exist),
   * and the detailsScraped on the corresponding jobAd will set to true - if the jobAd has been passed.
   * @param {Job} newJob job to be stored.
   * @param {Organization} newOrganization organization to be stored.
   * @param {JobAd?} newJobAd optional parameter, since Job can be scraped directly from the jobLink
   * @returns {Promise<boolean>} Promise resolving to the boolean signifying whether the SQL transaction was successful
   */
    private async sendScrapedJobForStoring(newJob: Job): Promise<Job | null> {
        const transaction = await db.sequelize.transaction();
        try {
            const createdOrganization = await this.organizationRepository.create(newJob.organization!, transaction);
            newJob.organizationId = createdOrganization.id;

            if (newJob.jobAd) { // job can be scraped without ad reference. This is the check if it has the reference to the ad.
                const scrapedJobAd = await this.jobAdRepository.markAsScraped(newJob.jobAd, transaction);
                newJob.jobAdId = scrapedJobAd.id;
            }

            const storedJob = await this.jobRepository.create(newJob, transaction);
            // const storedJob = await this.jobRepository.attachJobToOrganization(createdOrganization, newJob, transaction);

            await transaction.commit();
            return storedJob;
        } catch (exception) {
            console.log(`An exception occurred in sendScrapedJobForStoring() for url=${newJob.url}
                ${newJob.jobAd ? 'triplet (job, org, jobAd)' : 'pair (job, org)'} - [${exception}]`);
            await transaction.rollback();
            return null;
        }
    }

    /**
   * @description Function which sets JobAd properties postedDate and postedDateTimestamp from the connected Job object,
   * if they do not exist and returns the updated JobAd object.
   * @param {JobAd} jobAd jobAd which inherits the properties.
   * @param {Job} job job scraped based on the jobAd
   * @returns {Promise<JobAd>}
   */
    private inheritPropsFromJob(jobAd: JobAd, job: Job): JobAd {
        if (!jobAd.postedDate && job.postedDate) {
            jobAd.postedDate = job.postedDate;
            jobAd.postedDateTimestamp = this.utils.transformToTimestamp(jobAd.postedDate.toString()) ?? undefined;
        }
        
        jobAd.jobTitle = job.jobTitle;
        return jobAd;
    }

    /**
   * @description Function which sets creates a Job based on JobDTO and determines whether the job object
   * needs to be parsed in the future.
   * @param {JobDTO} newJob
   * @param {string} jobUrl
   * @returns {Promise<Job>}
   */
    private buildJobMap(newJob: JobDTO, jobUrl: string): Job {
        let newJobMAP = this.jobMapper.toMap(newJob);
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(jobUrl);

        newJobMAP.requiresParsing = this.jobParserHelper.requiresParsing(jobSource);

        return newJobMAP;
    }
}
