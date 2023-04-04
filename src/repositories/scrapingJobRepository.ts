import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { Service } from "typedi";
import { Job } from "../database/models/job";
import { JobAd } from "../database/models/jobAd";
import { GetJobsRequest } from "../helpers/dtos/getJobsRequest";
import { JobAdSource } from "../helpers/enums/jobAdSource";

@Service()
export default class ScrapingJobRepository {
    private MAX_BATCH_SIZE: number = 200;
    /**
   * @description Creates a job ad and returns it. Throws an error if encountered.
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
            console.log(paginatedJobs.length +' entries fetched');
    
            return paginatedJobs;
        } catch (exception) {
            throw `getJobsPaginated unsuccessful - [${exception}]`;
        }
    }
}
