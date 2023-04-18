import { Job } from "../../database/models/job";

export default interface IJobParser {
    parseJob: (job: Job) => Job
}
