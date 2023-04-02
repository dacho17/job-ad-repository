import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobScraper from "./IJobScraper";

export default interface IJobApiScraper extends IJobScraper {
    scrape: (jobAdId: number, jobUrl: string) => Promise<JobDTO>
}
