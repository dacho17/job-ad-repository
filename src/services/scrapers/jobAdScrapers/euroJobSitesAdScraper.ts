import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import { AdScraperUrlParams } from "../../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import IJobAdScraper from "../interfaces/IJobAdScraper";
import { BaseAdScraper } from "./baseAdScraper";


@Service()
export class EuroJobSitesAdScraper extends BaseAdScraper implements IJobAdScraper {
    private websites: JobAdSource[] = [
        JobAdSource.EURO_ENGINEER_JOBS,
        JobAdSource.EURO_SCIENCE_JOBS,
        JobAdSource.EURO_SPACE_CAREERS,
        JobAdSource.EURO_TECH_JOBS];

    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on EuroJobSites in the scrape is (jobTitle, companyName, companyLocation, shortDescription, postedAgo, applicationDeadline).
   * Only jobLink is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.UNDERSCORE_SIGN),
            reqNofAds: clientForm.reqNOfAds,
            location: clientForm?.location
        }
    
        const scrapedAds: JobAdDTO[] = [];
        for (let i = 0; i < this.websites.length; i++) {
            const newlyScrapedAds = await this.scrapeEuroJobSitesAds(urlParams, this.websites[i]);
            scrapedAds.push(...newlyScrapedAds);
        }

        return scrapedAds;
    }
}
