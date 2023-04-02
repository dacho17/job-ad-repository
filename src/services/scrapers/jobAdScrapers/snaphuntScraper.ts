import axios from "axios";

import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import { AdScraperTracker } from "../../../helpers/dtos/adScraperTracker";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import Utils from "../../../helpers/utils";
import IJobAdScraper from "../interfaces/IJobAdScraper";

@Service()
export default class SnaphuntAdScraper implements IJobAdScraper {
    @Inject()
    private utils: Utils;

    // private PAGE_SIZE: number = 10;

    /**
   * @description Function accepts client form, and based on it starts the jobAd scraping.
   * Data is fetched from Snaphunt API and is rich in terms of jobDetails.
   * The decision was made that during this scrape we are focusing on jobLinks only, and that the information will be
   * gathered in the job scrape along with the company information.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        // TODO: how to target a page, I only have pageSize right Now
        clientForm.jobTitle = clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.WHITESPACE_URL_ENCODING);
        let urlRemotePart = clientForm.scrapeOnlyRemote ? Constants.SNAPHUNT_REMOTE_QUERY_PARAMETER : Constants.EMPTY_STRING;
        // let locationPart = clientForm.location
        //     ? `&location=${clientForm.location.replace(Constants.WHITESPACE, Constants.WHITESPACE_URL_ENCODING).replace(Constants.COMMA_SIGN, Constants.ASCII_COMMA_SIGN_ENCODING)}`
        //     : Constants.EMPTY_STRING;
        const scraperTracker: AdScraperTracker = {
            nOfScrapedAds: 0,
            scrapedAds: [],
            currentPage: 1,
            url: Constants.SNAPHUNT_API_ADS_URL + `?searchText=${clientForm.jobTitle}${urlRemotePart}&pageSize=${clientForm.reqNOfAds}&isFeatured=false`
        }

        let jsonResponse = null;
        try {
            jsonResponse = await axios(scraperTracker.url!);
        } catch(exception) {
            throw `An exception occurred while accessing the url=${scraperTracker.url} - [${exception}]!`;
        }

        const jobAds = JSON.parse(JSON.stringify(jsonResponse.data)).body.list;
        jobAds.forEach((jobAd: any) => {
            const jobLink: string = `${Constants.SNAPHUNT_API_JOB_URL}${jobAd.jobReferenceId.trim()}`;
            const postedDateStr: string = jobAd.updatedAt.trim();
            const postedDate = new Date(postedDateStr);

            const newAd: JobAdDTO = {
                source: JobAdSource.SNAPHUNT,
                jobLink: jobLink,
                postedDate: postedDate,
                postedDateTimestamp: this.utils.transformToTimestamp(postedDateStr)
            };
            scraperTracker.scrapedAds.push(newAd);
        });

        console.log(scraperTracker.scrapedAds.length + " ads have been scraped in total.");
        return scraperTracker.scrapedAds;
    }
}
