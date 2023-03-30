import { Service } from "typedi";
import Constants from "../../helpers/constants";
import { AdScraperUrlParams } from "../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import { BaseAdScraper } from "./baseAdScraper";

@Service()
export class AdzunaAdScraper extends BaseAdScraper {
    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on Adzuna in the scrape is (jobTitle, companyName, officeLocation, estimatedSalary, shortDescription).
   * Only jobTitle is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.WHITESPACE_URL_ENCODING),
            reqNofAds: clientForm.reqNOfAds,
            location: clientForm?.location
        }
        
        return await this.scrapeAds(urlParams, JobAdSource.ADZUNA);
    }
}
