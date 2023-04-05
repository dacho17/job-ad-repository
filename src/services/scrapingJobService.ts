import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { Organization } from "../database/models/organization";
import { GetJobsRequest } from '../helpers/dtos/getJobsRequest';
import JobDTO from '../helpers/dtos/jobDTO';
import { JobAdSource } from "../helpers/enums/jobAdSource";
import JobMapper from "../helpers/mappers/jobMapper";
import OrganizationMappper from "../helpers/mappers/organizationMapper";
import Utils from "../helpers/utils";
import OrganizationRepository from "../repositories/organizationRepository";
import { ScrapingJobAdRepository } from "../repositories/scrapingJobAdRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import BrowserAPI from "./browserAPI";
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
    private jobMapper: JobMapper;
    private organizationMapper: OrganizationMappper;
    private browserAPI: BrowserAPI;
    private utils: Utils;

    constructor(
        @Inject() jobAdRepository: ScrapingJobAdRepository,
        @Inject() jobRepository: ScrapingJobRepository,
        @Inject() organizationRepository: OrganizationRepository,
        @Inject() jobScraperHelper: JobScraperHelper,
        @Inject() jobMapper: JobMapper,
        @Inject() organizationMapper: OrganizationMappper,
        @Inject() broserAPI: BrowserAPI,
        @Inject() utils: Utils,
    )
    {
        this.jobAdRepository = jobAdRepository;
        this.jobRepository = jobRepository;
        this.organizationRepository = organizationRepository;
        this.jobScraperHelper = jobScraperHelper;
        this.jobMapper = jobMapper;
        this.organizationMapper = organizationMapper;
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

            console.log(`${jobAdsWithoutScrapedJobs.length} jobads to be scraped`)
            for (let i = 0; i < jobAdsWithoutScrapedJobs.length; i++) {
                const jobScraper = this.getScraperFor(jobAdsWithoutScrapedJobs[i].source);
                if (!jobScraper) {
                    jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    continue;
                }
                
                console.log(`${jobAdQueryOffset + succStored}: ${jobAdsWithoutScrapedJobs[i].jobLink} to be scraped`);

                let newJobDTO;
                // differentiating between IJobBrowserScrapers and IJobApiScrapers
                try {
                    if (jobAdsWithoutScrapedJobs[i].source !== JobAdSource.SNAPHUNT) {
                        await this.browserAPI.openPage(jobAdsWithoutScrapedJobs[i].jobLink);
                        newJobDTO = await (jobScraper as IJobBrowserScraper).scrape(jobAdsWithoutScrapedJobs[i].id, this.browserAPI);
                    } else {
                        newJobDTO = await (jobScraper as IJobApiScraper).scrape(jobAdsWithoutScrapedJobs[i].id, jobAdsWithoutScrapedJobs[i].jobLink);                    
                    }
                } catch (exception) {
                    console.log(exception);
                    // TODO: mark this event somehow in the database because the ad might be inactive!
                    jobAdQueryOffset += 1;    // offset is to be added for the unscraped entries
                    continue;
                }

                const newOrganizationMAP = this.organizationMapper.toMap(newJobDTO.organization);
                const newJobMAP = this.jobMapper.toMap(newJobDTO);  // FK should already be set -> newJobMAP.jobAdId = jobAdsWithoutScrapedJobs[i].id; // setting a FK-jobAdId
                const newJobAdMAP = this.inheritPropsFromJob(jobAdsWithoutScrapedJobs[i], newJobMAP);
                
                const hasBeenStored = await this.sendScrapedJobForStoring(newJobMAP, newOrganizationMAP, newJobAdMAP);   
                
                if (hasBeenStored) succStored += 1;
                else jobAdQueryOffset += 1; // offset is to be added for the entries unsuccessfully stored to the DB
            }
        }

        await this.browserAPI.close();
        return [succStored, jobAdQueryOffset];
    }

    /**
   * @description Function accepts url from which a Job is to be scraped.
   * Job data is then scraped, along with the organization data, and they are stored into the Job and Organization table respectively.
   * @returns {Promise<JobDTO>} Promise resolving to JobDTO having connected OrganizationDTO as one of the properties.
   */
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
        const newOrgMAP = this.organizationMapper.toMap(newJobDTO.organization);

        const _ = await this.sendScrapedJobForStoring(newJobMAP, newOrgMAP, undefined);

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

    /**
   * @description Function which returns a jobScraper based on the JobAdSource value.
   * @param {JobAdSource} adSource
   * @returns {IJobScraper | null}
   */
    private getScraperFor(adSource: JobAdSource): IJobScraper | null {
        // first attempt to get a browserScraper
        let jobScraper = this.jobScraperHelper.getBrowserScraperFor(adSource);
        // if browser scraper is not found try getting apiScraper
        if (!jobScraper) {
            jobScraper = this.jobScraperHelper.getApiScraperFor(adSource);
        }

        return jobScraper;
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
    private async sendScrapedJobForStoring(newJob: Job, newOrganization: Organization, newJobAd?: JobAd): Promise<boolean> {
        const transaction = await db.sequelize.transaction();
        try {
            const createdOrganization = await this.organizationRepository.create(newOrganization, transaction);
            newJob.organizationId = createdOrganization.id; // assigning organizationId FK to the newJob
            await this.jobRepository.create(newJob, transaction);

            if (newJobAd) { // job can be scraped without ad reference. This is the check if it has the reference to the ad.
                await this.jobAdRepository.markAsScraped(newJobAd, transaction);
            }

            await transaction.commit();
            return true;
        } catch (exception) {
            console.log(`An exception occurred while storing a 
                ${newJobAd ? 'triplet (job, org, jobAd)' : 'pair (job, org)'} - [${exception}]`);
            await transaction.rollback();
            return false;
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
}
