import { Service } from "typedi";
import Constants from "../../helpers/constants";
import { AdScraperUrlParams } from "../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import { BaseAdScraper } from "./baseAdScraper";


@Service()
export class EuroJobsAdScraper extends BaseAdScraper {
    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on EuroJobs in the scrape is (jobTitle, companyLocation, companyName, postedDate).
   * Only jobLink is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.PLUS_SIGN),
            reqNofAds: clientForm.reqNOfAds
        }

        return await this.scrapeAds(urlParams, JobAdSource.EURO_JOBS);
    }
}
