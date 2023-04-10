import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { Service } from "typedi";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { Organization } from "../database/models/organization";
import { GetJobsRequest } from "../helpers/dtos/getJobsRequest";
import { JobAdSource } from "../helpers/enums/jobAdSource";
import DbQueryError from "../helpers/errors/dbQueryError";

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
        return await job.save({ transaction: t });
    }

    /**
   * @description Fetches the requested number of jobs, defined by searchWord, limited and offset by the passed parameters.
   * If there is an error, it is thrown.
   * @param {GetJobsRequest} getJobsReq
   * @returns {Promise<Job[]>} Promise containing the requested jobs.
   */
    public async getJobsPaginated(getJobsReq: GetJobsRequest): Promise<Job[]> {
        const paginatedJobs = await Job.findAll({
            where: {
                jobTitle: {
                    [Op.iLike]: `%${getJobsReq.jobTitleSearchWord}%`
                }
            },
            include: [
                {
                    model: JobAd,
                    where: {source: JobAdSource.ADZUNA},
                    required: true,
                },
                {
                    model: Organization,
                    where: {
                        name: {
                            [Op.iLike]: `%${getJobsReq.companyNameSearchWord}%`
                        }
                    },
                    required: true
                }
            
            ],
            limit: getJobsReq.batchSize > this.MAX_BATCH_SIZE ? this.MAX_BATCH_SIZE : getJobsReq.batchSize,
            offset: getJobsReq.offset
        });

        return paginatedJobs;
    }

    /**
   * @description Fetches the jobs to parse, including the companies they are connected to.
   * @param {number} offset
   * @param {number} batchSize
   * @returns {Promise<Job[]>} Promise containing the requested jobs.
   */
    public async getJobsToParse(offset: number, batchSize: number): Promise<Job[]> {
        const jobsToParse = await Job.findAll({
            where: {
                requiresParsing: true
            },
            limit: batchSize,
            offset: offset,
        });

        return jobsToParse;
    }

    /**
   * @description Fetches a job based on its id.
   * If there is an error, it is thrown.
   * @param {number} id
   * @returns {Promise<Job>} Promise containing the requested job.
   */
    public async getById(id: number): Promise<Job | null> {
        return await Job.findByPk(id);
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
