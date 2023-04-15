import { JobAdScrapingTaskStatus } from "../enums/jobAdScrapingTaskStatus";

export default class JobAdScrapingTaskDTO {
    public id: number;
    public startTime: Date;
    public endTime: Date | null;
    public status: JobAdScrapingTaskStatus;
    public numberOfAdsScraped: number | null;
}
