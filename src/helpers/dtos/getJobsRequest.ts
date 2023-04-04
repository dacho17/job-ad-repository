export class GetJobsRequest {
    companyNameSearchWord: string;
    jobTitleSearchWord: string;
    offset: number;
    batchSize: number;

    constructor(jobTitleSearchWord: string, companyNameSearchWord: string, offset: number, batchSize: number,) {
        this.jobTitleSearchWord = jobTitleSearchWord;
        this.companyNameSearchWord = companyNameSearchWord;
        this.offset = offset;
        this.batchSize = batchSize;
    }
}
