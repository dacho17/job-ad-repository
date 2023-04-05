import axios from 'axios';
import * as cheerio from 'cheerio';
import { Inject, Service } from 'typedi';
import Constants from '../../../helpers/constants';
import { AdScraperTracker } from '../../../helpers/dtos/adScraperTracker';
import { AdScraperUrlParams } from '../../../helpers/dtos/adScraperUrlParams';
import { JobAdDTO } from '../../../helpers/dtos/jobAdDTO';
import { ScrapeJobAdsForm } from '../../../helpers/dtos/scrapeJobAdsForm';
import { JobAdSource } from '../../../helpers/enums/jobAdSource';
import Utils from '../../../helpers/utils';
import IAdScraper from '../interfaces/IJobAdScraper';


@Service()
export class CareerBuilderScraper implements IAdScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on CareerBuilder in the scrape is (jobTitle, companyName, officeLocation, postedAgo, timeEngagement).
   * jobLink, and both postedDate and postedTimestamp if exist on the ad.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const urlParams: AdScraperUrlParams = {
            jobTitle: clientForm.jobTitle.replace(Constants.WHITESPACE, Constants.PLUS_SIGN),
            reqNofAds: clientForm.reqNOfAds,
            location: clientForm?.location,
            isRemote: clientForm?.scrapeOnlyRemote
        }

        const scraperTracker: AdScraperTracker = {
            nOfScrapedAds: 0,
            scrapedAds: [],
            currentPage: 1
        }

        while (scraperTracker.nOfScrapedAds < urlParams.reqNofAds) {
            scraperTracker.url = `${Constants.CAREER_BUILDER_URL}/jobs?cb_workhome=${urlParams.isRemote}&keywords=${urlParams.jobTitle}&page_number=${scraperTracker.currentPage}`;
            let response = null;
            try {
                response = await axios(scraperTracker.url);
            } catch(exception: any) {
                console.log(exception.message);
                throw `An exception occurred while accessing the url=${scraperTracker.url}!`;
            }
    
            const $ = cheerio.load(response.data);
    
            const postedDates: Date[] = [];
            $(Constants.CAREER_BUILDER_POSTINGDATE_SELECTOR).contents().toArray().map((elem: any) => {
                postedDates.push(this.utils.getPostedDate4CareerBuilder(elem.data.trim()));
            });
    
            const jobLinks: string[] = [];
            const jobAdElements = $(Constants.CAREER_BUILDER_JOB_ADS).toArray().map((elem: any) => {
                if (elem?.attributes !== undefined) {
                    const attr = elem.attributes;
                    const jobLink = Constants.CAREER_BUILDER_URL + attr.find((atr: any) => atr[Constants.CAREER_BUILDER_JOBLINK_SELECTOR[0]] == Constants.CAREER_BUILDER_JOBLINK_SELECTOR[1])[Constants.VALUE_SELECTOR].trim();
                    jobLinks.push(jobLink);
                }
            });

            for (let i = 0; i < jobLinks.length; i++) {
                const newAd: JobAdDTO = {
                    source: JobAdSource.CAREER_BUILDER,
                    jobLink: jobLinks[i],
                    postedDate: postedDates[i],
                    postedDateTimestamp: this.utils.transformToTimestamp(postedDates[i].toString()) ?? undefined
                };
    
                scraperTracker.scrapedAds.push(newAd);
            }
    
            if (!jobAdElements || jobAdElements.length == 0) break; 
            scraperTracker.currentPage += 1;
            scraperTracker.nOfScrapedAds += jobAdElements.length;
        }
    
        console.log(scraperTracker.scrapedAds.length + " ads have been scraped in total.");
        return scraperTracker.scrapedAds;
    }
}
