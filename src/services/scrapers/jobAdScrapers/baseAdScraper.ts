import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import { AdScraperUrlParams } from "../../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { AdScraperTracker } from "../../../helpers/dtos/adScraperTracker";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";


@Service()
export abstract class BaseAdScraper {
    @Inject()
    private browserAPI: BrowserAPI;
    @Inject()
    private utils: Utils;

    public abstract scrape(clientForm: ScrapeJobAdsForm): Promise<JobAdDTO[]>;

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
            await this.browserAPI.openPage(scraperTracker.url!);
            const jobAdElements = await this.browserAPI.findMultiple(selector);
            const postedAgoElements = await this.browserAPI.findMultiple(Constants.JOB_FLUENT_PUBLISHED_AGO_SELECTOR);
            for (let j = 0; j < jobAdElements.length; j++) {
                let jobLink = await this.browserAPI.getDataFromAttr(jobAdElements[j], Constants.HREF_SELECTOR);
                if (!jobLink) continue;
                console.log(jobLink);
                jobLink = this.formatJobLink(jobLink, adSource);
                const newAd: JobAdDTO = {
                    source: adSource,
                    jobLink: jobLink
                }
    
                if (JobAdSource.JOB_FLUENT === adSource) {
                    const publishedAgo = await this.browserAPI.getTextFrom(postedAgoElements[j]);
                    console.log(`Published ago value is ${publishedAgo}\n`);
                    if (publishedAgo) {
                        newAd.postedDate = this.utils.getPostedDate4JobFluent(publishedAgo);
                        newAd.postedDateTimestamp = this.utils.transformToTimestamp(newAd.postedDate.toString());
                    }

                    console.log(newAd);
                }
    
                scraperTracker.scrapedAds.push(newAd);
                scraperTracker.nOfScrapedAds += 1;
            }
    
            if (!jobAdElements || jobAdElements.length == 0) break; 
            scraperTracker.currentPage += 1;
    
            if (adSource === JobAdSource.SIMPLY_HIRED) {
                const navigationButtons = await this.browserAPI.findMultiple(Constants.SIMPLY_HIRED_NAVIGATION_BUTTONS_SELECTOR);
                for (let i = 0; i < navigationButtons.length; i++) {
                    const [candidateButtonPageContent, candidateUrl] = 
                        await this.browserAPI.getDataFromTwoAttrs(navigationButtons[i], Constants.ARIALABEL_SELECTOR, Constants.HREF_SELECTOR)
                    if (!candidateButtonPageContent || !candidateUrl) continue;
                    const pageElementSegments = candidateButtonPageContent.split(Constants.WHITESPACE);
                    const pageNumberCandidate = parseInt(pageElementSegments[1].trim());
                    if (isNaN(pageNumberCandidate)) continue;
                    if (pageNumberCandidate == scraperTracker.currentPage) {
                        scraperTracker.url = candidateUrl;
                        break;
                    }
                }

                await this.browserAPI.openPage(scraperTracker.url!);
            }
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
            case JobAdSource.CAREER_JET:
                return Constants.CAREER_JET_URL + jobLink.trim();
            case JobAdSource.CV_LIBRARY:
                return Constants.CV_LIBRARY_URL + jobLink.trim();
            case JobAdSource.GRADUATELAND:
                return Constants.GRADUATELAND_URL + jobLink.trim();
            case JobAdSource.JOB_FLUENT:
                return Constants.JOB_FLUENT_URL + jobLink.trim();
            case JobAdSource.NO_FLUFF_JOBS:
                return Constants.NO_FLUFF_JOBS_URL + jobLink.trim();
            case JobAdSource.QREER:
                return Constants.QREER_URL + jobLink.trim();
            case JobAdSource.SIMPLY_HIRED:
                return Constants.SIMPLY_HIRED_URL + jobLink.trim();
            case JobAdSource.TYBA:
                return Constants.TYBA_URL + jobLink.trim();
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
            case JobAdSource.ARBEIT_NOW:
                scraperTracker.url = `https://www.arbeitnow.com/?search=${urlParams.jobTitle}&page=${scraperTracker.currentPage}`
                return Constants.ARBEITNOW_JOBLINKS_SELECTOR;
            case JobAdSource.CAREER_JET:
                scraperTracker.url = `${Constants.CAREER_JET_URL}/search/jobs?s=${urlParams.jobTitle}&l=${urlParams.location}&p=${scraperTracker.currentPage}`;
                return Constants.CAREER_JET_JOBLINKS_SELECTOR;
            case JobAdSource.CV_LIBRARY:
                scraperTracker.url = `${Constants.CV_LIBRARY_URL}/${urlParams.jobTitle}?&page=${scraperTracker.currentPage}`;
                return Constants.CV_LIBRARY_JOBLINKS_SELECTOR;
           case JobAdSource.EURO_JOBS:
                scraperTracker.url = `https://eurojobs.com/search-results-jobs/?action=search&listing_type%5Bequal%5D=Job&keywords%5Ball_words%5D=${urlParams.jobTitle}&page=${scraperTracker.currentPage}&view=list`;
                return Constants.EURO_JOBS_JOBLINKS_SELECTOR;
            case JobAdSource.GRADUATELAND:
                scraperTracker.url = `${Constants.GRADUATELAND_URL}/en/jobs?keyword=${urlParams.jobTitle}&limit=10&offset=${scraperTracker.nOfScrapedAds}`
                return Constants.GRADUATELAND_JOBLINKS_SELECTOR;
            case JobAdSource.JOB_FLUENT:
                scraperTracker.url = `${Constants.JOB_FLUENT_URL}/jobs-remote?q=${urlParams.jobTitle}&page=${scraperTracker.currentPage}`;
                return Constants.JOB_FLUENT_JOBLINKS_SELECTOR;
            case JobAdSource.NO_FLUFF_JOBS:
                scraperTracker.url = `${Constants.NO_FLUFF_JOBS_URL}/${urlParams.jobTitle}?page=${scraperTracker.currentPage}`;
                return Constants.NO_FLUFF_JOBS_JOBLINKS_SELECTOR;
            case JobAdSource.QREER:
                scraperTracker.url = `${Constants.QREER_URL}/engineering-jobs/keyword:${urlParams.jobTitle}/page:${scraperTracker.currentPage}`;
                return Constants.QREER_JOBLINKS_SELECTOR;
            case JobAdSource.SIMPLY_HIRED:
                scraperTracker.url = `${Constants.SIMPLY_HIRED_URL}/search?q=${urlParams.jobTitle}&l=${urlParams.location}`;
                return Constants.SIMPLY_HIRED_JOBLINKS_SELECTOR;
            case JobAdSource.TYBA:
                scraperTracker.url = `${Constants.TYBA_URL}/jobs?keyword=${urlParams.jobTitle}&limit=10&offset=${scraperTracker.nOfScrapedAds}`;
                return Constants.TYBA_JOBLINKS_SELECTOR;
            default:
                throw Constants.AD_SOURCE_NOT_RECOGNIZED;
        }
    }
}
