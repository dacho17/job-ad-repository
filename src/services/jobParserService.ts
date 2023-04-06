import { Inject, Service } from "typedi";
import db from "../database/db";
import { Job } from "../database/models/job";
import JobDTO from "../helpers/dtos/jobDTO";
import JobMapper from "../helpers/mappers/jobMapper";
import Utils from "../helpers/utils";
import OrganizationRepository from "../repositories/organizationRepository";
import ScrapingJobRepository from "../repositories/scrapingJobRepository";
import JobParserHelper from "./jobParserHelper";
import { ScrapingJobService } from "./scrapingJobService";

@Service()
export default class JobParserService {
    private BATCH_SIZE: number = 1;
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
        if (!job) throw `Job has not been scraped successfully from url=${url}`;

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
            return null;
        }
    }

    private async getStoredJob(job: JobDTO): Promise<Job | null> {
        const fetchedJob = await this.jobRepository.getById(job.id!);
        console.log(`orgId=${fetchedJob?.organizationId} sads`);
        const fetchedOrg = await this.organizationRepository.getById(fetchedJob?.organizationId!)
        
        fetchedJob!.organization = fetchedOrg ?? undefined;
        return fetchedJob;
    }
}
