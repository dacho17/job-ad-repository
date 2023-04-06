import { Inject, Service } from "typedi";
import JobDTO from "../helpers/dtos/jobDTO";
import JobMapper from "../helpers/mappers/jobMapper";
import Utils from "../helpers/utils";
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

        const jobToBeParsed = await this.jobRepository.getById(job.id!);
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(url);
        const jobParser = this.jobParserHelper.getParserFor(jobSource);
        if (!jobParser) throw `Parser not found for the provided url=${url}`;
        if (!jobToBeParsed) throw `Job with the passed jobId=${job.id} has not been found`;

        const parsedJob = jobParser.parseJob(jobToBeParsed);
        const updatedJob = await this.jobRepository.update(parsedJob);
        if (updatedJob) {
            return this.jobMapper.toDTO(updatedJob);
        }
        return null;
        
    }
}
