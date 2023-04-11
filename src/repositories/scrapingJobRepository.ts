import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { Service } from "typedi";
import db from '../database/db';
import { Job } from "../database/models/job";
import { Organization } from "../database/models/organization";
import { GetJobsRequest } from "../helpers/dtos/getJobsRequest";


@Service()
export default class ScrapingJobRepository {
    private MAX_BATCH_SIZE: number = 200;

    /**
   * @description Creates a job and returns it.
   * @param {Job} job Job MAP object which is to be stored
   * @param {Transaction} t Function can be executed as a part of transaction
   * @returns {Promise<Job>} Promise containing the stored job.
   */
    public async create(job: Job, t?: Transaction): Promise<Job> {
        return await job.save({ transaction: t });
    }

    public async attachJobToOrganization(org: Organization, job: Job, t?: Transaction): Promise<Job> {
        return await org.addJob(job, {transaction: t});
    }

    /**
   * @description Fetches the requested number of jobs, defined by jobTitle and companyName searchWords. 
   * Each returned job includes the organization and the ad if they are related to any.
   * The list of results is limited and offset by the passed parameters.
   * @param {GetJobsRequest} getJobsReq
   * @returns {Promise<Job[]>} Promise containing the requested jobs.
   */
    public async getJobsPaginated(getJobsReq: GetJobsRequest): Promise<Job[]> {
        const paginatedJobs = await db.Job.findAll({
            where: {
                jobTitle: {
                    [Op.iLike]: `%${getJobsReq.jobTitleSearchWord}%`
                }
            },
            include: [
                {
                    association: db.Job.associations.jobAd,
                },
                {
                    association: db.Job.associations.organization,
                    where: {
                        name: {
                            [Op.iLike]: `%${getJobsReq.companyNameSearchWord}%`
                        }
                    }
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
        const jobsToParse = await db.Job.findAll({
            where: {
                requiresParsing: true
            },
            limit: batchSize,
            offset: offset,
            include: [
                db.Job.associations.organization
            ]
        });

        return jobsToParse;
    }

    /**
   * @description Fetches a job based on its id, and the oraganization attached to it.
   * @param {number} id
   * @returns {Promise<Job>} Promise containing the requested job.
   */
    public async getById(id: number): Promise<Job | null> {
        return await db.Job.findByPk(id, {
            include: [
                db.Job.associations.organization,
            ]
        });
    }

    /**
   * @description Updates the job and returns it.
   * @param {Job} job Job MAP object which is to be updated
   * @param {Transaction?} t transaction as part of which the update query is executed
   * @returns {Promise<Job>} Promise containing the updated job.
   */
    public async update(job: Job, t?: Transaction): Promise<Job> {
        return await job.save({transaction: t});
    }

    /**
   * @description Sets requiresParsing and parsedDate properties of the job, 
   * and updates the entry in the database.
   * @param {Job} job Job MAP object which is to be updated
   * @param {Transaction?} t transaction as part of which the update query is executed
   * @returns {Promise<Job>} Promise containing the updated job.
   */
    public async markJobAsParsed(job: Job, t?: Transaction): Promise<Job> {
        job.requiresParsing = false;
        job.parsedDate = new Date(Date.now());
        return await this.update(job, t);
    }
}
