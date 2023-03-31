import Constants from '../../helpers/constants';
import { Service } from "typedi";
import { AdScraperUrlParams } from "../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../helpers/dtos/scrapeJobAdsForm";
import { BaseAdScraper } from "./baseAdScraper";
import { JobAdSource } from '../../helpers/enums/jobAdSource';

@Service()
export class CarerJetAdScraper extends BaseAdScraper {
    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on CareerJet in the scrape is (jobTitle, companyName, companyLocation, salary/sometimes, shortDescription).
   * Only jobLink is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.PLUS_SIGN),
            reqNofAds: clientForm.reqNOfAds,
            location: clientForm.location?.replace(Constants.WHITESPACE, Constants.PLUS_SIGN)
        }
        
        return await this.scrapeAds(urlParams, JobAdSource.CAREER_JET);
    }
}
