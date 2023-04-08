import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { Service } from "typedi";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { Organization } from "../database/models/organization";
import { GetJobsRequest } from "../helpers/dtos/getJobsRequest";
import { JobAdSource } from "../helpers/enums/jobAdSource";

@Service()
export default class ScrapingJobRepository {
    private MAX_BATCH_SIZE: number = 200;

    /**
   * @description Creates a job and returns it. Throws an error if encountered.
   * @param {Job} job Job MAP object which is to be stored
   * @param {Transaction} t Function can be executed as a part of transaction
   * @returns {Promise<Job>} Promise containing the stored job.
   */
    public async create(job: Job, t?: Transaction): Promise<Job> {
        try {
            const res = await job.save({ transaction: t });
            return res;    
        } catch (exception) {
            throw `An exception occurred while storing a job with jobAdId=${job.jobAdId}. - [${exception}]`;
        }
    }

    /**
   * @description Fetches the requested number of jobs, defined by searchWord, limited and offset by the passed parameters.
   * If there is an error, it is thrown.
   * @param {GetJobsRequest} getJobsReq
   * @returns {Promise<Job[]>} Promise containing the requested jobs.
   */
    public async getJobsPaginated(getJobsReq: GetJobsRequest): Promise<Job[]> {
        try {
            const paginatedJobs = await Job.findAll({
                where: {
                    jobTitle: {
                        [Op.iLike]: `%${getJobsReq.jobTitleSearchWord}%`
                    },
                    companyName: {
                        [Op.iLike]: `%${getJobsReq.companyNameSearchWord}%`
                    },
                },
                include: [{
                    model: JobAd,
                    where: {source: JobAdSource.ADZUNA},
                    required: true,
                }],
                limit: getJobsReq.batchSize > this.MAX_BATCH_SIZE ? this.MAX_BATCH_SIZE : getJobsReq.batchSize,
                offset: getJobsReq.offset
            });
    
            return paginatedJobs;
        } catch (exception) {
            throw `getJobsPaginated unsuccessful - [${exception}]`;
        }
    }

    /**
   * @description Fetches the jobs to parse, including the companies they are connected to.
   * If there is an error, it is thrown.
   * @param {number} offset
   * @param {number} batchSize
   * @returns {Promise<Job[]>} Promise containing the requested jobs.
   */
    public async getJobsToParse(offset: number, batchSize: number): Promise<Job[]> {
        try {
            const jobsToParse = await Job.findAll({
                where: {
                    requiresParsing: true
                },
                limit: batchSize,
                offset: offset,
            });

            return jobsToParse;
        } catch (exception) {
            throw `getJobsToParse failed - [${exception}]`;
        }
    }

    /**
   * @description Fetches a job based on its id.
   * If there is an error, it is thrown.
   * @param {number} id
   * @returns {Promise<Job>} Promise containing the requested job.
   */
    public async getById(id: number): Promise<Job | null> {
        try {
            const job = await Job.findByPk(id);

            return job;
        } catch (exception) {
            throw `getById failed - [${exception}]`;
        }
    }

    /**
   * @description Updates the job and returns it. Throws an error if encountered.
   * @param {Job} job Job MAP object which is to be updated
   * @param {Transaction?} t transaction as part of which the update query is executed
   * @returns {Promise<Job>} Promise containing the updated job.
   */
    public async update(job: Job, t?: Transaction): Promise<Job> {
        try {
            return await job.save({transaction: t});
        } catch (exception) {
            throw `An attempt to update the job with jobId=${job.id} has failed. - [${exception}]`;
        }
    }
}
