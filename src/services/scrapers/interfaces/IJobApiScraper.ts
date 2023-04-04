import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobScraper from "./IJobScraper";

export default interface IJobApiScraper extends IJobScraper {
    scrape: (jobAdId: number | null, jobUrl: string) => Promise<JobDTO>
}
