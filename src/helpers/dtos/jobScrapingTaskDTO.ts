import { JobAdScrapingTaskStatus } from "../enums/jobAdScrapingTaskStatus";

export default class JobScrapingTaskDTO {
    id: number;
    startTime: Date;
    endTime: Date | null;
    status: JobAdScrapingTaskStatus;
    numberOfSuccessfullyScraped: number | null;
    numberOfUnsuccessfullyScraped: number | null;
}
