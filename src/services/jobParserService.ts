import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import JobDTO from "../helpers/dtos/jobDTO";
import DbQueryError from "../helpers/errors/dbQueryError";
import ParseError from "../helpers/errors/parseError";
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
        
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const jobParser = this.jobParserHelper.getParserFor(jobSource);
        if (!jobParser){
            console.log(`Parser has not been found for the job with the provided url=${url}`);
            throw new UnrecognizedDataError(`Provided url can not be processed by the application.`);
        }

        let parsedJob;
        try {
            parsedJob = jobParser.parseJob(job);
        } catch (err) {
            console.log(`Error occurred while parsing the job with id=${parsedJob?.id} - [${err}]`);
            throw new ParseError(`Error occurred while parsing the job.`);
        }

        try {
            const updatedJob = await this.sendParsedJobForStoring(parsedJob);
            return this.jobMapper.toDTO(updatedJob);
        } catch (err) {
            throw err;
        }
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
                console.log(`Failed to getJobsToParse - [${exception}]`);
                throw new DbQueryError('An error occurred while trying to fetch data');
            }

            if (jobsToParse.length === 0) {
                break;
            }
            
            for (let i = 0; i < jobsToParse.length; i++) {
                const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(jobsToParse[i].url);
                const parser = await this.jobParserHelper.getParserFor(jobSource);

                let parsedJob;
                try {
                    parsedJob = parser?.parseJob(jobsToParse[i]);
                } catch (err) {
                    console.log(`Parsing failed for job with id=${jobsToParse[i].id} - [${err}]`);
                    offset += 1;
                    unsuccessfullyParsed += 1;
                    continue;
                }

                try {
                    await this.sendParsedJobForStoring(parsedJob!);
                    successfullyParsed += 1;
                } catch (err) { // error message logged in the called method
                    unsuccessfullyParsed += 1;
                    offset += 1;
                }
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
    private async sendParsedJobForStoring(newJob: Job): Promise<Job> {
        const transaction = await db.sequelize.transaction();
        try {
            const _ = await this.organizationRepository.update(newJob.organization!, transaction);
            const storedJob = await this.jobRepository.markJobAsParsed(newJob, transaction);

            await transaction.commit();
            return storedJob;
        } catch (exception) {
            console.log(`An exception occurred while storing a 'pair (job id=${newJob.id}, org id=${newJob.organization?.id})'} - [${exception}]`);
            await transaction.rollback();
            throw new DbQueryError(`An error occured while attempting to store the data.`);
        }
    }
}
