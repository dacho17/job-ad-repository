import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import JobDTO from "../helpers/dtos/jobDTO";
import ScrapeError from "../helpers/errors/scrapeError";
import JobMapper from "../helpers/mappers/jobMapper";
import Utils from "../helpers/utils";
import OrganizationRepository from "../repositories/organizationRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import JobParserHelper from "./jobParserHelper";
import { ScrapingJobService } from "./scrapingJobService";

@Service()
export default class JobParserService {
    private BATCH_SIZE: number = 100;
    @Inject()
    private jobParserHelper: JobParserHelper;
    @Inject()
    private jobRepository: ScrapingJobRepository;
    @Inject()
    private organizationRepository: OrganizationRepository;
    @Inject()
    private jobScrapingService: ScrapingJobService;
    @Inject()
    private jobMapper: JobMapper;
    @Inject()
    private utils: Utils;

     /**
   * @description Function accepts url from which a Job is to be scraped.
   * Job data is then scraped, along with the organization data and they are stored into the Job and Organization table respectively.
   * Further, the job data is parsed and updated in the databse afterwards.
   * @returns {Promise<JobDTO | null>} Promise resolving to JobDTO having connected OrganizationDTO as one of the properties.
   */
    public async scrapeAndParseJobFromUrl(url: string): Promise<JobDTO | null> {
        const job = await this.jobScrapingService.scrapeJobFromUrl(url);
        if (!job) throw new ScrapeError(`Job has not been scraped successfully from url=${url}`);

        console.log(`Organization of scraped job is ${job.organization}`);

        const jobToBeParsed = await this.getStoredJob(job);
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const jobParser = this.jobParserHelper.getParserFor(jobSource);
        if (!jobParser) throw `Parser not found for the provided url=${url}`;
        if (!jobToBeParsed) throw `Job with the passed jobId=${job.id} has not been found`;

        const parsedJob = jobParser.parseJob(jobToBeParsed);
        console.log(`Id of organization=${parsedJob.organization?.id}`);

        const updatedJob = await this.sendParsedJobForStoring(parsedJob);
        if (updatedJob) {
            return this.jobMapper.toDTO(updatedJob);
        }
        return null;
    }

     /**
   * @description Function fetches the jobs which need to be parsed from the database.
   * Jobs are then parsed and updated in the database. Finally the function returns both the number of successfully,
   * and unsuccessfully stored entries.
   * @returns {Promise<[number, number]>}
   */
    public async fetchAndParseUnparsedJobs(): Promise<[number, number]> {
        let offset = 0;
        let unsuccessfullyParsed = 0;
        let successfullyParsed = 0;
        for (;;) {
            const jobsToParse = await this.jobRepository.getJobsToParse(offset, this.BATCH_SIZE);
            if (jobsToParse.length === 0) {
                break;
            }
            
            for (let i = 0; i < jobsToParse.length; i++) {
                const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(jobsToParse[i].url);
                const parser = await this.jobParserHelper.getParserFor(jobSource);
                if (!parser) throw `Parser has not been found for job with jobId=${jobsToParse[i].id}`;

                const organization = await this.organizationRepository.getById(jobsToParse[i].organizationId!);
                jobsToParse[i].organization = organization ?? undefined;
                const parsedJob = parser?.parseJob(jobsToParse[i]);

                if (!parsedJob) {
                    offset += 1;
                    unsuccessfullyParsed += 1;
                    continue;
                }

                parsedJob.requiresParsing = false;
                parsedJob.parsedDate = new Date(Date.now());
                const storedJob = await this.sendParsedJobForStoring(parsedJob);
                if (!storedJob) {
                    unsuccessfullyParsed += 1;
                    offset += 1;
                } else successfullyParsed += 1;
            }
        }
        
        return [successfullyParsed, unsuccessfullyParsed];
    }

    /**
   * @description Function which starts a transaction and interacts with jobRepository and organizationRepository.
   * Within the transaction a new job will be updated, along with the company.
   * @param {Job} newJob job to be updated.
   * @returns {Promise<boolean>} Promise resolving to the boolean signifying whether the SQL transaction was successful
   */
    private async sendParsedJobForStoring(newJob: Job): Promise<Job | null> {
        const transaction = await db.sequelize.transaction();
        try {
            const _ = await this.organizationRepository.update(newJob.organization!, transaction);
            const storedJob = await this.jobRepository.update(newJob, transaction);

            await transaction.commit();
            return storedJob;
        } catch (exception) {
            console.log(`An exception occurred while storing a 'pair (job, org)'} - [${exception}]`);
            await transaction.rollback();
            throw `An exception occurred while storing a 'pair (job, org)'} - [${exception}]`;
        }
    }

    /**
   * @description Function which orders job repository to fetch the job based on the id provided, and the
   * connected organization.
   * @param {JobDTO} job jobDTO counterpart of the Job to be fetched from the database.
   * @returns {Promise<Job | null>}
   */
    private async getStoredJob(job: JobDTO): Promise<Job | null> {
        const fetchedJob = await this.jobRepository.getById(job.id!);
        const fetchedOrg = await this.organizationRepository.getById(fetchedJob?.organizationId!)
        
        fetchedJob!.organization = fetchedOrg ?? undefined;
        return fetchedJob;
    }
}
