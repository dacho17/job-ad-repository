export class GetJobsRequest {
    searchWord: string;
    offset: number;
    batchSize: number;

    constructor(searchWord: string, offset: number, batchSize: number,) {
        this.searchWord = searchWord;
        this.offset = offset;
        this.batchSize = batchSize;
    }
}
