import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";

export default interface IJobScraper {
    scrape: (jobAdId: number, browserAPI: BrowserAPI) => Promise<JobDTO>;
}
