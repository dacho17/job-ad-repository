import { Job } from "../../database/models/job";

export default interface IKeyWordParser {
    parseKeyWords: (inputString: string, job: Job) => void;
}
