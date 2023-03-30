import { JobAdSource } from "../enums/jobAdSource";

export class JobAdDTO {
    source: JobAdSource;
    jobLink: string;
    jobTitle?: string;
    postedDate?: Date;

    constructor(source: JobAdSource, jobLink: string, jobTitle: string, postedDate: Date) {
        this.source = source;
        this.jobLink = jobLink;
        this.jobTitle = jobTitle;
        this.postedDate = postedDate;
    }
}
