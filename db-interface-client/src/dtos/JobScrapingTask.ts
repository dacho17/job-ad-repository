import { JobAdScrapingTaskStatus } from "../enums/jobAdScrapingTaskStatus";

export interface JobScrapingTask {
    id: number;
    startTime: Date;
    endTime: Date | null;
    status: JobAdScrapingTaskStatus;
    numberOfSuccessfullyScraped: number | null;
    numberOfUnsuccessfullyScraped: number | null;
}
