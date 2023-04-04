import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobScraper from "./IJobScraper";

export default interface IJobBrowserScraper extends IJobScraper {
    scrape: (jobAdId: number | null, browserAPI: BrowserAPI) => Promise<JobDTO>;
}
