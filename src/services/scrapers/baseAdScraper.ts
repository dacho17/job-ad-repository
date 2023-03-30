import { Inject, Service } from "typedi";
import Constants from "../../helpers/constants";
import { AdScraperTracker } from "../../helpers/dtos/adScraperTracker";
import { AdScraperUrlParams } from "../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../helpers/dtos/jobAdDTO";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import BrowserAPI from "../browserAPI";

@Service()
export class BaseAdScraper {
    @Inject()
    private browserAPI: BrowserAPI;

    /**
   * @description Function that accepts requested parameters from the client and based on them returns a list of scraped JobAdDTOs
   * @param {AdScraperUrlParams} urlParams @param {JobAdSource} adSource
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    protected async scrapeAds(urlParams: AdScraperUrlParams, adSource: JobAdSource): Promise<JobAdDTO[]> {
        const scraperTracker: AdScraperTracker = {
            nOfScrapedAds: 0,
            scrapedAds: [],
            currentPage: 1
        }
        await this.browserAPI.run();
        while (scraperTracker.nOfScrapedAds < urlParams.reqNofAds) {
            const selector = this.getSiteData(urlParams, scraperTracker, adSource);
            let page = await this.browserAPI.openPage(scraperTracker.url!);
            const jobAdElements = await this.browserAPI.findMultiple(selector);
            for (let j = 0; j < jobAdElements.length; j++) {
                let jobLink = await this.browserAPI.getDataFromAttr(jobAdElements[j], Constants.HREF_SELECTOR);
                if (!jobLink) continue;
                console.log(jobLink);
                jobLink = this.formatJobLink(jobLink, adSource);
                const newAd: JobAdDTO = {
                    source: adSource,
                    jobLink: jobLink
                }
    
                // if (AdSource.JOB_FLUENT === adSource) {
                //     const publishedAgoElement = await page.$(Constants.JOB_FLUENT_PUBLISHED_AGO_SELECTOR);
                //     if (publishedAgoElement) {
                //         const publishedAgo = await page.evaluate(el => el.innerText, publishedAgoElement);
                //         const postedDate = Utils.getPostedDate4JobFluent(publishedAgo);
                //         newAd.postingDate = Utils.transformToTimestamp(postedDate.toString());                        
                //     }
                // }
    
                scraperTracker.scrapedAds.push(newAd);
                scraperTracker.nOfScrapedAds += 1;
            }
    
            if (!jobAdElements || jobAdElements.length == 0) break; 
            scraperTracker.currentPage += 1;
    
            // if (adSource === AdSource.SIMPLY_HIRED) {
            //     const navigationButtons = await page.$$(Constants.SIMPLY_HIRED_NAVIGATION_BUTTONS_SELECTOR);
            //     for (let i = 0; i < navigationButtons.length; i++) {
            //         const [candidateButtonPageContent, candidateUrl] = await page.evaluate((el, selectorOne, selectorTwo) => 
            //             [el.getAttribute(selectorOne), el.getAttribute(selectorTwo)],
            //                 navigationButtons[i], Constants.ARIALABEL_SELECTOR, Constants.HREF_SELECTOR);
            //         const pageElementSegments = candidateButtonPageContent.split(Constants.WHITESPACE);
            //         if (isNaN(parseInt(pageElementSegments[1]))) continue;
            //         if (parseInt(pageElementSegments[1]) == scrapeTracker.currentPage) {
            //             scrapeTracker.url = candidateUrl;
            //             break;
            //         }
            //     }
            //     page = await Browser.openPage(browser, scrapeTracker.url);
            // }
        }
    
        console.log(scraperTracker.scrapedAds.length + " ads have been scraped in total.");
        await this.browserAPI.close();
        return scraperTracker.scrapedAds;
    }

    /**
     * @description Function that accepts the scraped url and jobAdSource. Based on the jobAdSource the url is formatted and returned.
     * @param {string} jobLink @param {JobAdSource} jobAdSource
     * @returns {string} Returns the formatted url.
     */
    private formatJobLink(jobLink: string, adSource: JobAdSource): string {
        switch(adSource) {
            // case AdSource.CAREER_JET:
            //     return Constants.CAREER_JET_URL + jobLink.trim();
            // case AdSource.CV_LIBRARY:
            //     return Constants.CV_LIBRARY_URL + jobLink.trim();
            // case AdSource.GRADUATELAND:
            //     return Constants.GRADUATELAND_URL + jobLink.trim();
            // case AdSource.JOB_FLUENT:
            //     return Constants.JOB_FLUENT_URL + jobLink.trim();
            // case AdSource.NO_FLUFF_JOBS:
            //     return Constants.NO_FLUFF_JOBS_URL + jobLink.trim();
            // case AdSource.QREER:
            //     return Constants.QREER_URL + jobLink.trim();
            // case AdSource.SIMPLY_HIRED:
            //     return Constants.SIMPLY_HIRED_URL + jobLink.trim();
            // case AdSource.TYBA:
            //     return Constants.TYBA_URL + jobLink.trim();
            default:    // adzuna, arbeitNow, cvLibrary, euroJobs,
                return jobLink.trim();
        }
    }

    /**
     * @description Function that accepts requested parameters from the client, AdScraperTracker object, and jobAdSource.
     * Based on the parameters, the function constructs the url which will be scraped for jobAds, and returns the selector
     * which will be used to target the ads on the website.
     * @param {AdScraperUrlParams} urlParams @param {AdScraperTracker} scraperTracker @param {JobAdSource} jobAdSource
     * @returns {string} Returns the element selector.
     */
    private getSiteData(urlParams: AdScraperUrlParams, scraperTracker: AdScraperTracker, jobAdSource: JobAdSource): string {
        switch (jobAdSource) {
            case JobAdSource.ADZUNA:
                scraperTracker.url = `https://www.adzuna.com/search?q=${urlParams.jobTitle}&p=${scraperTracker.currentPage}`;
                return Constants.ADZUNA_JOBLINKS_SELECTOR;
        //     case AdSource.ARBEIT_NOW:
        //         scrapeTracker.url = `https://www.arbeitnow.com/?search=${urlParams.jobTitle}&page=${scrapeTracker.currentPage}`
        //         return Constants.ARBEITNOW_JOB_ADS;
        //     case AdSource.CAREER_JET:
        //         scrapeTracker.url = `${Constants.CAREER_JET_URL}/search/jobs?s=${urlParams.jobTitle}&l=${urlParams.location}&p=${scrapeTracker.currentPage}`;
        //         return Constants.CAREER_JET_JOBLINKS_SELECTOR;
        //     case AdSource.CV_LIBRARY:
        //         scrapeTracker.url = `${Constants.CV_LIBRARY_URL}/${urlParams.jobTitle}?&page=${scrapeTracker.currentPage}`;
        //         return Constants.CV_LIBRARY_JOBLINKS_SELECTOR;
        //    case AdSource.EURO_JOBS:
        //         scrapeTracker.url = `https://eurojobs.com/search-results-jobs/?action=search&listing_type%5Bequal%5D=Job&keywords%5Ball_words%5D=${urlParams.jobTitle}&page=${scrapeTracker.currentPage}&view=list`;
        //         return Constants.EURO_JOBS_JOBLINKS_SELECTOR;
        //     case AdSource.GRADUATELAND:
        //         scrapeTracker.url = `${Constants.GRADUATELAND_URL}/en/jobs?keyword=${urlParams.jobTitle}&limit=10&offset=${scrapeTracker.nOfScrapedAds}`
        //         return Constants.GRADUATELAND_JOBLINKS_SELECTOR;
        //     case AdSource.JOB_FLUENT:
        //         scrapeTracker.url = `${Constants.JOB_FLUENT_URL}/jobs-remote?q=${urlParams.jobTitle}&page=${scrapeTracker.currentPage}`;
        //         return Constants.JOB_FLUENT_JOBLINKS_SELECTOR;
        //     case AdSource.NO_FLUFF_JOBS:
        //         scrapeTracker.url = `${Constants.NO_FLUFF_JOBS_URL}/${urlParams.jobTitle}?page=${scrapeTracker.currentPage}`;
        //         return Constants.NO_FLUFF_JOBS_JOBLINKS_SELECTOR;
        //     case AdSource.QREER:
        //         scrapeTracker.url = `${Constants.QREER_URL}/engineering-jobs/keyword:${urlParams.jobTitle}/page:${scrapeTracker.currentPage}`;
        //         return Constants.QREER_JOBLINKS_SELECTOR;
        //     case AdSource.SIMPLY_HIRED:
        //         scrapeTracker.url = `${Constants.SIMPLY_HIRED_URL}/search?q=${urlParams.jobTitle}&l=${urlParams.location}`;
        //         return Constants.SIMPLY_HIRED_JOBLINKS_SELECTOR;
        //     case AdSource.TYBA:
        //         scrapeTracker.url = `${Constants.TYBA_URL}/jobs?keyword=${urlParams.jobTitle}&limit=10&offset=${scrapeTracker.nOfScrapedAds}`;
        //         return Constants.TYBA_JOBLINKS_SELECTOR;
            default:
                throw Constants.AD_SOURCE_NOT_RECOGNIZED;
        }
    }
}
