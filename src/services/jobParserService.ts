import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import JobDTO from "../helpers/dtos/jobDTO";
import DbQueryError from "../helpers/errors/dbQueryError";
import ParseError from "../helpers/errors/parseError";
import ScrapeError from "../helpers/errors/scrapeError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
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
        let job = await this.jobScrapingService.scrapeJobFromUrl(url);
        if (!job) return null;

        let jobToBeParsed;
        try {
            jobToBeParsed = await this.getStoredJob(job);
        } catch(err) {
            console.log(`Error while fetching job to be parsed id=${job.id}, url=${job.url} from the database. - [${err}]`);
            throw new DbQueryError(`An error occurred wile attempting to fetch the stored job.`);
        }
        
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const jobParser = this.jobParserHelper.getParserFor(jobSource);
        if (!jobParser){
            console.log(`Parser has not been found for the job with the provided url=${url}`);
            throw new UnrecognizedDataError(`Provided url can not be processed by the application.`);
        }
        if (!jobToBeParsed){
            console.log(`Job with the passed jobId=${job.id} has not been found`);
            throw new DbQueryError(`There has been an error while trying to find the stored entry.`);
        }

        let parsedJob;
        try {
            parsedJob = jobParser.parseJob(jobToBeParsed);
        } catch (err) {
            console.log(`Error occurred while parsing the job with id=${parsedJob?.id} - [${err}]`);
            throw new ParseError(`Error occurred while parsing the job.`);
        }

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
            let jobsToParse;
            try {
                jobsToParse = await this.jobRepository.getJobsToParse(offset, this.BATCH_SIZE);
            } catch (exception) {
                throw new DbQueryError(`getJobsToParse failed - [${exception}]`);
            }

            if (jobsToParse.length === 0) {
                break;
            }
            
            for (let i = 0; i < jobsToParse.length; i++) {
                const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(jobsToParse[i].url);

                const parser = await this.jobParserHelper.getParserFor(jobSource);
                if (!parser) {  // should not happen...
                    console.log(`Parser has not been found for job with jobId=${jobsToParse[i].id}`);
                    offset += 1;
                    unsuccessfullyParsed += 1;
                    continue;
                }

                let organization;
                try {
                    organization = await this.organizationRepository.getById(jobsToParse[i].organizationId!);
                } catch (err) {
                    console.log(`getById failed for organization with id=${jobsToParse[i].organizationId}- [${err}]`);
                }
                
                jobsToParse[i].organization = organization ?? undefined;

                let parsedJob;
                try {
                    parsedJob = parser?.parseJob(jobsToParse[i]);
                } catch (err) {
                    console.log(`Parsing failed for job with id=${jobsToParse[i].id}`);
                    offset += 1;
                    unsuccessfullyParsed += 1;
                    continue;
                }

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
   * Within the transaction a new job will be updated, along with the organization.
   * @param {Job} newJob job to be updated.
   * @returns {Promise<Job | null>}
   */
    private async sendParsedJobForStoring(newJob: Job): Promise<Job | null> {
        const transaction = await db.sequelize.transaction();
        try {
            newJob.requiresParsing = false;
            newJob.parsedDate = new Date(Date.now());
            const _ = await this.organizationRepository.update(newJob.organization!, transaction);
            const storedJob = await this.jobRepository.update(newJob, transaction);

            await transaction.commit();
            return storedJob;
        } catch (exception) {
            console.log(`An exception occurred while storing a 'pair (job id=${newJob.id}, org id=${newJob.organization?.id})'} - [${exception}]`);
            await transaction.rollback();
            return null;
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
