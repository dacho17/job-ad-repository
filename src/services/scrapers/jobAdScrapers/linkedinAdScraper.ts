import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import { AdScraperUrlParams } from "../../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import IJobAdScraper from "../interfaces/IJobAdScraper";
import { BaseAdScraper } from "./baseAdScraper";

@Service()
export default class LinkedInAdScraper extends BaseAdScraper implements IJobAdScraper {

    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.UFT_PLUS_SIGN_ENCODING),
            reqNofAds: clientForm.reqNOfAds,
            location: clientForm.location?.replace(Constants.WHITESPACE, Constants.UFT_PLUS_SIGN_ENCODING) || Constants.EMPTY_STRING
        }

        return await this.scrapeAds(urlParams, JobAdSource.LINKEDIN);
    }
}
