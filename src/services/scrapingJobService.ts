import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { GetJobsRequest } from '../helpers/dtos/getJobsRequest';
import JobDTO from '../helpers/dtos/jobDTO';
import { JobAdSource } from "../helpers/enums/jobAdSource";
import JobMapper from "../helpers/mappers/jobMapper";
import Utils from "../helpers/utils";
import { ScrapingJobAdRepository } from "../repositories/scrapingJobAdRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import BrowserAPI from "./browserAPI";
import IJobApiScraper from './scrapers/interfaces/IJobApiScraper';
import IJobBrowserScraper from './scrapers/interfaces/IJobBrowserScraper';
import JobScraperHelper from "./scrapers/jobScraperHelper";

@Service()
export class ScrapingJobService {
    private jobAdRepository: ScrapingJobAdRepository;
    private jobRepository: ScrapingJobRepository;
    private jobScraperHelper: JobScraperHelper;
    private jobMapper: JobMapper;
    private browserAPI: BrowserAPI;
    private utils: Utils;

    constructor(
        @Inject() jobAdRepository: ScrapingJobAdRepository,
        @Inject() jobRepository: ScrapingJobRepository,
        @Inject() jobScraperHelper: JobScraperHelper,
        @Inject() jobMapper: JobMapper,
        @Inject() broserAPI: BrowserAPI,
        @Inject() utils: Utils,
    )
    {
        this.jobAdRepository = jobAdRepository;
        this.jobRepository = jobRepository;
        this.jobScraperHelper = jobScraperHelper;
        this.jobMapper = jobMapper;
        this.browserAPI = broserAPI;
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
        let succStored = 0;
        await this.browserAPI.run();
        for (;;) {
            const jobAdsWithoutScrapedJobs = await this.jobAdRepository.getAdsWithUnscrapedJobs(jobAdQueryOffset);
            if (jobAdsWithoutScrapedJobs.length === 0) break;

            const jobsAndAdsToBeStored: [Job, JobAd][] = [];
            console.log(`${jobAdsWithoutScrapedJobs.length} jobads to be scraped`)
            for (let i = 0; i < jobAdsWithoutScrapedJobs.length; i++) {
                const jobScraper = this.getScraperFor(jobAdsWithoutScrapedJobs[i].source);
                if (!jobScraper) {
                    jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    continue;
                }
                
                console.log(`${jobAdQueryOffset + succStored + i}: ${jobAdsWithoutScrapedJobs[i].jobLink} to be scraped`);

                let newJobDTO;
                // differentiating between IJobBrowserScrapers and IJobApiScrapers
                if (jobAdsWithoutScrapedJobs[i].source !== JobAdSource.SNAPHUNT) {
                    await this.browserAPI.openPage(jobAdsWithoutScrapedJobs[i].jobLink);
                    newJobDTO = await (jobScraper as IJobBrowserScraper).scrape(jobAdsWithoutScrapedJobs[i].id, this.browserAPI);
                } else {
                    newJobDTO = await (jobScraper as IJobApiScraper).scrape(jobAdsWithoutScrapedJobs[i].id, jobAdsWithoutScrapedJobs[i].jobLink);                    
                }
                const newJobMAP = this.jobMapper.toMap(newJobDTO);
                newJobMAP.postedDate = newJobMAP.postedDate || jobAdsWithoutScrapedJobs[i].postedDate;  // inheriting from jobAd if not found on the job post
                // FK should already be set -> newJobMAP.jobAdId = jobAdsWithoutScrapedJobs[i].id; // setting a FK-jobAdId

                jobsAndAdsToBeStored.push([newJobMAP, jobAdsWithoutScrapedJobs[i]]);
            }

            const [storedCounter, notStoredCounter] = await this.sendScrapedJobsForStoring(jobsAndAdsToBeStored);
            jobAdQueryOffset += notStoredCounter;   // offset is to be added for the entries unsuccessfully stored to the DB
            succStored += storedCounter;
        }


        await this.browserAPI.close();
        return [succStored, jobAdQueryOffset];
    }

    public async scrapeJobFromUrl(url: string): Promise<JobDTO> {
        await this.browserAPI.run();
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const scraper = this.getScraperFor(jobSource);
        if (!scraper) throw `Scraper not found for the provided url=${url}`;

        let newJobDTO;
        // differentiating between IJobBrowserScrapers and IJobApiScrapers
        if (jobSource !== JobAdSource.SNAPHUNT) {
            await this.browserAPI.openPage(url);
            newJobDTO = await (scraper as IJobBrowserScraper).scrape(null, this.browserAPI);
        } else {
            newJobDTO = await (scraper as IJobApiScraper).scrape(null, url);                    
        }
        const newJobMAP = this.jobMapper.toMap(newJobDTO);                
        await this.jobRepository.create(newJobMAP);

        return newJobDTO;
    }

    /**
   * @description Function fetches jobs from jobRepository given limit, offset and searchWord.
   * @param {GetJobsRequest} getJobsReq
   * @returns {Promise<JobDTO[]>} Promise resolving to the jobDTO list
   */
    public async getJobsPaginated(getJobsReq: GetJobsRequest): Promise<JobDTO[]> {
        const jobs = await this.jobRepository.getJobsPaginated(getJobsReq);
        const jobDtos = jobs.map(jobMAP => this.jobMapper.toDTO(jobMAP));

        return jobDtos;
    }

    private getScraperFor(adSource: JobAdSource) {
        // first attempt to get a browserScraper
        let jobScraper = this.jobScraperHelper.getBrowserScraperFor(adSource);
        // if browser scraper is not found try getting apiScraper
        if (!jobScraper) {
            jobScraper = this.jobScraperHelper.getApiScraperFor(adSource);
        }

        return jobScraper;
    }

    /**
   * @description Function which starts a transaction and interacts with jobAdRepository and jobRepository.
   * Within the transaction a new job will be created and the detailsScraped on the corresponding job will set to true.
   * @param {[Job, JobAd][]} jobsAndAdsToBeStored the list jobs and ads to be stored.
   * @returns {Promise<[number, number]>} Promise resolving to the tuple containing
   * number of successfully and unsuccessfully stored jobs.
   */
    private async sendScrapedJobsForStoring(jobsAndAdsToBeStored: [Job, JobAd][]): Promise<[number, number]> {
        let storedCounter = 0;
        let notStoredCounter = 0;
        for (let i = 0; i < jobsAndAdsToBeStored.length; i++) {
            const newJob = jobsAndAdsToBeStored[i][0];
            const newJobAd = jobsAndAdsToBeStored[i][1];

            const transaction = await db.sequelize.transaction();
            try {
                await this.jobRepository.create(newJob, transaction);
                await this.jobAdRepository.markAsScraped(newJobAd, transaction);
                await transaction.commit();
                storedCounter += 1;
            } catch (exception) {
                console.log(`An exception occurred while storing a pair (job, jobAd) - [${exception}]`);
                await transaction.rollback();
                notStoredCounter += 1;
            }
        }

        return [storedCounter, notStoredCounter];
    }
}
