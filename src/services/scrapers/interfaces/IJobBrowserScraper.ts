import { JobAd } from "../../../database/models/jobAd";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobScraper from "./IJobScraper";

export default interface IJobBrowserScraper extends IJobScraper {
    scrape: (jobAd: JobAd | null, browserAPI: BrowserAPI) => Promise<JobDTO | null>;
}
