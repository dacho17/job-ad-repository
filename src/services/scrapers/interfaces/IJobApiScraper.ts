import { JobAd } from "../../../database/models/jobAd";
import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobScraper from "./IJobScraper";

export default interface IJobApiScraper extends IJobScraper {
    scrape: (jobAd: JobAd | null, jobUrl: string) => Promise<JobDTO | null>
}
