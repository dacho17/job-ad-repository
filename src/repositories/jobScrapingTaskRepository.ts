import { Service } from "typedi";
import db from "../database/db";
import { JobScrapingTask } from "../database/models/jobScrapingTask";
import { JobAdScrapingTaskStatus } from "../helpers/enums/jobAdScrapingTaskStatus";

@Service()
export default class JobScrapingTaskRepository {
    private JOB_SCRAPING_TASK_BATCH_SIZE: number = 10;

    /**
   * @description Function attempts to create a jobScrapingTask with the provided userId.
   * It also sets the status of the task to CREATED.
   * @param {number} userId
   * @returns {Promise<JobScrapingTask[] | null>}
   */
    public async create(userId: number) {
        return await db.JobScrapingTask.create({
            status: JobAdScrapingTaskStatus.CREATED,
            userId: userId
        });
    }

    /**
   * @description Function attempts to update the given jobScrapingTask in the database.
   * @param {JobScrapingTask} jobScrapingTask
   * @returns {Promise<JobScrapingTask | null>}
   */
    public async update(jobScrapingTask: JobScrapingTask): Promise<JobScrapingTask> {
        return await jobScrapingTask.save();
    }

    /**
   * @description Function attempts to set startTime and status (to RUNNING) properties of the jobScrapingTask with the provided id.
   * @param {number} id
   * @returns {Promise<JobScrapingTask | null>}
   */
    public async markAsRunning(id: number): Promise<JobScrapingTask | null> {
        let jobScrapingTask = await db.JobScrapingTask.findByPk(id);

        if (jobScrapingTask) {
            jobScrapingTask.startTime = new Date(Date.now());
            jobScrapingTask.status = JobAdScrapingTaskStatus.RUNNING;
            return await this.update(jobScrapingTask);
        }

        return jobScrapingTask;   // null
    }

    /**
   * @description Function attempts to set endTime and status (to FINISHED) properties of the jobScrapingTask with the provided id.
   * @param {number} id
   * @param {number} succScraped
   * @param {number} unSuccScraped
   * @returns {Promise<JobScrapingTask | null>}
   */
    public async markAsFinished(id: number, succScraped: number, unSuccScraped: number): Promise<JobScrapingTask | null> {
        let jobScrapingTask = await db.JobScrapingTask.findByPk(id);

        if (jobScrapingTask) {
            jobScrapingTask.endTime = new Date(Date.now());
            jobScrapingTask.status = JobAdScrapingTaskStatus.FINISHED;
            jobScrapingTask.numberOfSuccessfullyScrapedJobs = succScraped;
            jobScrapingTask.numberOfUnSuccessfullyScrapedJobs = unSuccScraped;
            return await this.update(jobScrapingTask);
        }

        return jobScrapingTask;   // null
    }

    /**
   * @description Function attempts to fetch list of offsetted jobScrapingTasks for the user with the provided userId.
   * @param {number} userId 
   * @param {number} offset
   * @returns {Promise<JobScrapingTask[] | null>}
   */
    public async getJobScrapingTasksForUser(userId: number, offset: number): Promise<JobScrapingTask[] | null> {
        return await db.JobScrapingTask.findAll({
            where: {
                userId: userId
            },
            offset: offset,
            limit: this.JOB_SCRAPING_TASK_BATCH_SIZE
        });
    }
}
