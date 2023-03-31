import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";

export default interface IJobAdScraper {
    scrape: (clientForm: ScrapeJobAdsForm) => Promise<JobAdDTO[]>;
}
