import { Service } from "typedi";
import db from "../database/db";
import { JobAdScrapingTask } from "../database/models/jobAdScrapingTask";
import { JobAdScrapingTaskStatus } from "../helpers/enums/jobAdScrapingTaskStatus";

@Service()
export default class JobAdScrapingTaskRepository {
    private JOB_AD_SCRAPING_TASK_BATCH_SIZE: number = 10;

    /**
   * @description Function attempts to create a jobAdScrapingTask with the provided scrapeParams and the userId.
   * It also sets the status of the task to CREATED.
   * @param {string} scrapeParams 
   * @param {number} userId
   * @returns {Promise<JobAdScrapingTask[] | null>}
   */
    public async createWithParams(scrapeParams: string, userId: number): Promise<JobAdScrapingTask> {
        return await db.JobAdScrapingTask.create({
            status: JobAdScrapingTaskStatus.CREATED,
            scrapeParams: scrapeParams,
            userId: userId
        });
    }

    /**
   * @description Function attempts to update the given jobAdScrapingTask in the database.
   * @param {JobAdScrapingTask} jobAdScrapingTask
   * @returns {Promise<JobAdScrapingTask | null>}
   */
    public async update(jobAdScrapingTask: JobAdScrapingTask): Promise<JobAdScrapingTask> {
        return await jobAdScrapingTask.save();
    }

    /**
   * @description Function attempts to set startTime and status (to RUNNING) properties of the jobAdScrapingTask with the provided id.
   * @param {number} id
   * @returns {Promise<JobAdScrapingTask | null>}
   */
    public async markAsRunning(id: number): Promise<JobAdScrapingTask | null> {
        let jobAdScrapingTask = await db.JobAdScrapingTask.findByPk(id);

        if (jobAdScrapingTask) {
            jobAdScrapingTask.startTime = new Date(Date.now());
            jobAdScrapingTask.status = JobAdScrapingTaskStatus.RUNNING;
            return await this.update(jobAdScrapingTask);
        }

        return jobAdScrapingTask;   // null
    }

    /**
   * @description Function attempts to set endTime and status (to FINISHED) properties of the jobAdScrapingTask with the provided id.
   * @param {number} id
   * @returns {Promise<JobAdScrapingTask | null>}
   */
    public async markAsFinished(id: number): Promise<JobAdScrapingTask | null> {
        let jobAdScrapingTask = await db.JobAdScrapingTask.findByPk(id);

        if (jobAdScrapingTask) {
            jobAdScrapingTask.endTime = new Date(Date.now());
            jobAdScrapingTask.status = JobAdScrapingTaskStatus.FINISHED;
            return await this.update(jobAdScrapingTask);
        }

        return jobAdScrapingTask;   // null
    }

    /**
   * @description Function attempts to set endTime and status (to TERMINATED) properties of the jobAdScrapingTask with the provided id.
   * @param {number} id
   * @returns {Promise<JobAdScrapingTask | null>}
   */
    public async markAsTerminated(id: number): Promise<JobAdScrapingTask | null> {
        let jobAdScrapingTask = await db.JobAdScrapingTask.findByPk(id);

        if (jobAdScrapingTask) {
            jobAdScrapingTask.endTime = new Date(Date.now());
            jobAdScrapingTask.status = JobAdScrapingTaskStatus.TERMINATED;
            return await this.update(jobAdScrapingTask);
        }

        return jobAdScrapingTask;   // null
    }

    /**
   * @description Function attempts to fetch list of offsetted jobAdScrapingTasks for the user with the provided userId.
   * @param {number} userId 
   * @param {number} offset
   * @returns {Promise<JobAdScrapingTask[] | null>}
   */
    public async getJobAdScrapingTasksForUser(userId: number, offset: number): Promise<JobAdScrapingTask[] | null> {
        return await db.JobAdScrapingTask.findAll({
            where: {
                userId: userId
            },
            offset: offset,
            limit: this.JOB_AD_SCRAPING_TASK_BATCH_SIZE
        });
    }
}
