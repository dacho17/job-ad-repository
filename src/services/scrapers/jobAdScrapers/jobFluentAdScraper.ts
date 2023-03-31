import { Service } from "typedi";
import { AdScraperUrlParams } from "../../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import IJobAdScraper from "../interfaces/IJobAdScraper";
import { BaseAdScraper } from "./baseAdScraper";


@Service()
export class JobFluentAdScraper extends BaseAdScraper implements IJobAdScraper{
    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on JobFluent in the scrape is (jobTitle, publishedDate, skillsRequired).
   * The function scrapes jobLink, and both postedDate and postedTimestamp if exist on the ad.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle,
            reqNofAds: clientForm.reqNOfAds
        }

        return await this.scrapeAds(urlParams, JobAdSource.JOB_FLUENT);
    }
}
