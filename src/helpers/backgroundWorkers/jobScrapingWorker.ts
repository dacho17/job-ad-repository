import Container, { Inject } from "typedi";
import { parentPort, workerData } from "worker_threads";
import JobScrapingTaskRepository from "../../repositories/jobScrapingTaskRepository";
import { ScrapingJobAdRepository } from "../../repositories/scrapingJobAdRepository";
import BrowserAPI from "../../services/browserAPI";
import IJobApiScraper from "../../services/scrapers/interfaces/IJobApiScraper";
import IJobBrowserScraper from "../../services/scrapers/interfaces/IJobBrowserScraper";
import JobScraperHelper from "../../services/scrapers/jobScraperHelper";
import constants from "../constants";
import { JobAdSource } from "../enums/jobAdSource";
import DbQueryError from "../errors/dbQueryError";
import OrganizationMappper from "../mappers/organizationMapper";

export class JobScrapingWorker {
    private browserAPI: BrowserAPI;
    private jobAdRepository: ScrapingJobAdRepository;
    private jobScraperHelper: JobScraperHelper;
    private organizationMapper: OrganizationMappper;
    private jobScrapingTaskRepository: JobScrapingTaskRepository;
    
    constructor(
        @Inject() browserAPI: BrowserAPI,
        @Inject() jobAdRepository: ScrapingJobAdRepository,
        @Inject() jobScraperHelper: JobScraperHelper,
        @Inject() organizationMapper: OrganizationMappper,
        @Inject() jobScrapingTaskRepository: JobScrapingTaskRepository,
    ) {
        this.browserAPI = browserAPI;
        this.jobAdRepository = jobAdRepository;
        this.jobScraperHelper = jobScraperHelper;
        this.organizationMapper = organizationMapper;
        this.jobScrapingTaskRepository = jobScrapingTaskRepository;
    }

    /**
   * @description This function is ran as a specially delegated thread which will perform a task of scraping jobs which have
   * not yet been scraped, asynchroniously after client has made a request.
   * It will update the jobScrapingTask which it is connected to, when the task starts running and when it finishes.
   * There is no error handling implemented for the function ATM.
   */
    public async run() {
        const jobScrapingTaskId = workerData.jobScrapingTaskId;

        try {
            await this.jobScrapingTaskRepository.markAsRunning(jobScrapingTaskId);
        } catch (err) {
            console.log(`An error occurred while attempting to mark as RUNNING the jobScrapingTask with id=${jobScrapingTaskId}`);
            return;
        }

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

                let newJobMAP = this.jobScraperHelper.buildJobMap(newJobDTO, jobAdsWithoutScrapedJobs[i].jobLink);  // FK should already be set -> newJobMAP.jobAdId = jobAdsWithoutScrapedJobs[i].id; // setting a FK-jobAdId
                newJobMAP.jobAd = this.jobScraperHelper.inheritPropsFromJob(jobAdsWithoutScrapedJobs[i], newJobMAP);
                newJobMAP.organization = this.organizationMapper.toMap(newJobDTO.organization);

                let storedJob = await this.jobScraperHelper.sendScrapedJobForStoring(newJobMAP);
                if (storedJob) {
                    succStored += 1;
                } else {
                    jobAdQueryOffset += 1;  // offset is to be added for the entries unsuccessfully stored to the DB
                    console.log(`Scraped job has not been stored successfully.`)
                }
            }
        }

        await this.browserAPI.close();

        try {
            await this.jobScrapingTaskRepository.markAsFinished(jobScrapingTaskId, succStored, jobAdQueryOffset);
        } catch (err) {
            console.log(`An error occurred while attempting to mark as FINISHED the jobScrapingTask with id=${jobScrapingTaskId}`);
            return;
        }
    }
}

const worker = new JobScrapingWorker(
    Container.get(BrowserAPI),
    Container.get(ScrapingJobAdRepository),
    Container.get(JobScraperHelper),
    Container.get(OrganizationMappper),
    Container.get(JobScrapingTaskRepository)
);

worker.run();
