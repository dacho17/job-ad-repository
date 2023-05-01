import Container, { Inject } from "typedi";
import { parentPort, workerData } from "worker_threads";
import JobAdScrapingTaskRepository from "../../repositories/jobAdScrapingTaskRepository";
import { ScrapingJobAdService } from "../../services/scrapingJobAdService";
import { ScrapeJobAdsForm } from "../dtos/scrapeJobAdsForm";
import { JobAdScrapingTaskStatus } from "../enums/jobAdScrapingTaskStatus";
import { JobAdScrapingTask } from "../../database/models/jobAdScrapingTask";
import constants from "../constants";

class JobAdScrapingWorker {
    private jobAdScrapingService: ScrapingJobAdService;
    private jobAdScrapingTaskRepository: JobAdScrapingTaskRepository;

    constructor(
        @Inject() jobAdScrapingService: ScrapingJobAdService,
        @Inject() jobAdScrapingTaskRepository: JobAdScrapingTaskRepository,
    ) {
        this.jobAdScrapingService = jobAdScrapingService;
        this.jobAdScrapingTaskRepository = jobAdScrapingTaskRepository;
    }

    /**
   * @description This function is ran by a specially delegated thread which will perform a task of scraping job ads
   * asynchroniously after client has made a request. It will update the jobAdScrapingTask which it is connected to,
   * when the task starts running and when it finishes.
   * There is no error handling implemented for the function ATM.
   */
    async run() {
        const clientForm = {
            jobTitle: workerData.jobTitle,
            location: workerData.location,
            reqNOfAds: workerData.reqNumberOfAds,
            scrapeOnlyRemote: workerData.isRemote
        } as ScrapeJobAdsForm;

        // can communicate with the parent process through parentPort!.postMessage(strMessage);

        let jobAdScrapingTask: JobAdScrapingTask | null;
        try {
            jobAdScrapingTask = await this.jobAdScrapingTaskRepository.markAsRunning(workerData.jobAdScrapingTaskId);
        } catch (err) {
            parentPort?.postMessage(`An error occurred while attempting to mark the jobAdScrapingTask [id=${workerData.jobAdScrapingTaskId}] as RUNNING.`);
            parentPort?.postMessage(constants.WORKER_OPERATION_TERMINATED);
            return;
        }

        let totalAdsScraped = 0;
        let jobAdScrapers = this.jobAdScrapingService.getScrapers();
        for (let i = 0; i < jobAdScrapers.length; i++) {
            totalAdsScraped += await this.jobAdScrapingService.scrapeJobAds(clientForm, jobAdScrapers[i]);
        }

        jobAdScrapingTask!.numberOfAdsScraped = totalAdsScraped;
        jobAdScrapingTask!.endTime = new Date(Date.now());
        jobAdScrapingTask!.status = JobAdScrapingTaskStatus.FINISHED;
        try {
            await this.jobAdScrapingTaskRepository.update(jobAdScrapingTask!);
        } catch (err) {
            parentPort?.postMessage(`An error occurred while attempting to mark the jobAdScrapingTask [id=${workerData.jobAdScrapingTaskId}] as FINISHED.`);
            parentPort?.postMessage(constants.WORKER_OPERATION_TERMINATED);
        }
    }
}

const worker = new JobAdScrapingWorker(
    Container.get(ScrapingJobAdService),
    Container.get(JobAdScrapingTaskRepository)
);
worker.run();
