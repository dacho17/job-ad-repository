import { Job } from "../../database/models/job";
import { Organization } from "../../database/models/organization";

export default interface IJobParser {
    parseJob: (job: Job, organization?: Organization) => Job
}
