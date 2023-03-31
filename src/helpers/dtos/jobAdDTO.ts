import { JobAdSource } from "../enums/jobAdSource";

export class JobAdDTO {
    source: JobAdSource;
    jobLink: string;
    jobTitle?: string;
    postedDate?: Date;
    postedDateTimestamp?: number;

    constructor(source: JobAdSource, jobLink: string, jobTitle: string, postedDate: Date, postedDateTimestamp: number) {
        this.source = source;
        this.jobLink = jobLink;
        this.jobTitle = jobTitle;
        this.postedDate = postedDate;
        this.postedDateTimestamp = postedDateTimestamp;
    }
}
