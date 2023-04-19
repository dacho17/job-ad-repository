import { JobAdScrapingTaskStatus } from "../enums/jobAdScrapingTaskStatus";

export interface JobAdScrapingTask {
    id: number;
    startTime: Date;
    endTime: Date | null;
    status: JobAdScrapingTaskStatus;
    numberOfAdsScraped: number | null;
}
