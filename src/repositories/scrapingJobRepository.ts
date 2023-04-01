import { Transaction } from "sequelize";
import { Service } from "typedi";
import { Job } from "../database/models/job";

@Service()
export default class ScrapingJobRepository {
    /**
   * @description Creates a job ad and returns it. Throws an error if encountered.
   * @param {Job} job Job MAP object which is to be stored
   * @param {Transaction} t Function can be executed as a part of transaction
   * @returns {Promise<Job>} Promise containing the stored job.
   */
    public async create(job: Job, t: Transaction): Promise<Job> {
        try {
            const res = await job.save({ transaction: t });
            return res;    
        } catch (exception) {
            throw `An exception occurred while storing a job with jobAdId=${job.jobAdId}. - [${exception}]`;
        }
    }
}
