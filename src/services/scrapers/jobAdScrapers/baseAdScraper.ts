import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import { AdScraperUrlParams } from "../../../helpers/dtos/adScraperUrlParams";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { AdScraperTracker } from "../../../helpers/dtos/adScraperTracker";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import { ElementHandle } from "puppeteer";


@Service()
export class BaseAdScraper {
    @Inject()
    protected browserAPI: BrowserAPI;
    @Inject()
    private utils: Utils;

    /**
   * @description Function accepts requested parameters from the client and based on them returns a list of scraped JobAdDTOs
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
            const jobAdSelector = this.getSiteData(urlParams, scraperTracker, adSource);
            await this.browserAPI.openPage(scraperTracker.url!);
            
            let postedAgoList: (string | null)[] = [];  // gathering postedAgo information for several websites which contain it
            if ([JobAdSource.JOB_FLUENT, JobAdSource.LINKEDIN].includes(adSource)) {
                postedAgoList = await this.getPostedAgoList(adSource);
            }

            const numberOfAdsScraped = await this.scrapePage(scraperTracker, adSource, jobAdSelector, postedAgoList);
            if (numberOfAdsScraped === 0) break;
            scraperTracker.currentPage += 1;
        }
    
        console.log(scraperTracker.scrapedAds.length + " ads have been scraped in total.");
        await this.browserAPI.close();
        return scraperTracker.scrapedAds;
    }

    /**
   * @description Function accepts job ad website (one of the four euroJobSites) url parameters and returns the list of scraped JobAdDTOs.
   * @param {AdScraperUrlParams} urlParams @param {JobAdSource} adSource
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    protected async scrapeEuroJobSitesAds(urlParams: AdScraperUrlParams, adSource: JobAdSource): Promise<JobAdDTO[]> {
        await this.browserAPI.run();
        const scraperTracker = this.getEuroJobSiteData(urlParams, adSource);
        await this.browserAPI.openPage(scraperTracker.url!);
        
        const postedDateElements = await this.getPostedAgoList(adSource);
        await this.scrapePage(scraperTracker, adSource, Constants.EURO_JOB_SITES_JOBLINKS_SELECTOR_ONE, postedDateElements);
        await this.scrapePage(scraperTracker, adSource, Constants.EURO_JOB_SITES_JOBLINKS_SELECTOR_TWO, postedDateElements.splice(scraperTracker.nOfScrapedAds));
    
        await this.browserAPI.close();
        return scraperTracker.scrapedAds;
    }

    /**
   * @description Main function of the class, that extracts and formats data from the website, finally attaching
   * it to the newly created JobAdDTO object. 
   * @param {AdScraperTracker} scraperTracker @param {JobAdSource} adSource
   * @param {ElementHandle<Element>[]} jobAdElements @param {(string | null)[]} postedAgoList
   * @returns {Promise<number>} Returns the number of scraped job ads.
   */
    protected async scrapeJobAdElements(scraperTracker: AdScraperTracker, adSource: JobAdSource, jobAdElements: ElementHandle<Element>[], postedAgoList: (string | null)[]): Promise<number> {
        let nOfScrapedAds = 0;
        console.log(`${jobAdElements.length} job ads to be scraped`);
        for (let i = 0; i < jobAdElements.length; i++) {
            let jobLink = await this.browserAPI.getDataFromAttr(jobAdElements[i], Constants.HREF_SELECTOR);
            if (!jobLink) continue;

            const newAd: JobAdDTO = {
                source: adSource,
                jobLink: this.formatJobLink(jobLink, adSource),
            }

            if (postedAgoList.length !== 0 && postedAgoList[i]) {
                await this.setPostedDate(newAd, postedAgoList[i]!, adSource);
            }
            
            scraperTracker.scrapedAds.push(newAd);
            scraperTracker.nOfScrapedAds += 1;
            nOfScrapedAds += 1;
            await jobAdElements[i].dispose();

            if (adSource === JobAdSource.SIMPLY_HIRED) {
                const navigationButtons = await this.browserAPI.findMultiple(Constants.SIMPLY_HIRED_NAVIGATION_BUTTONS_SELECTOR);
                for (let i = 0; i < navigationButtons.length; i++) {
                    const candidateButtonPageContent = await this.browserAPI.getDataFromAttr(navigationButtons[i], Constants.ARIALABEL_SELECTOR);
                    const candidateUrl = await this.browserAPI.getDataFromAttr(navigationButtons[i], Constants.HREF_SELECTOR);
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

        return nOfScrapedAds;
    }

    /**
   * @description Function accepts data about the page to be scraped, job ad selector and element handles to posted ago elements if they are present.
   * @param {AdScraperTracker} scraperTracker @param {JobAdSource} adSource @param {string} adSelector @param {string} postedAgoElements
   * @returns {Promise<n>} Returns the number of job ads scraped from the page.
   */
    private async scrapePage(scraperTracker: AdScraperTracker, adSource: JobAdSource, adSelector: string, postedAgoList: (string | null)[]): Promise<number> {
        const jobAdElements = await this.browserAPI.findMultiple(adSelector);
        const nOfScrapedAds = await this.scrapeJobAdElements(scraperTracker, adSource, jobAdElements, postedAgoList);
        
        return nOfScrapedAds;
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
            case JobAdSource.EURO_ENGINEER_JOBS:
                return Constants.EURO_ENGINEERING_URL + jobLink.trim();
            case JobAdSource.EURO_SCIENCE_JOBS:
                return Constants.EURO_SCIENCE_URL + jobLink.trim();
            case JobAdSource.EURO_SPACE_CAREERS:
                return Constants.EURO_SPACE_CAREERS_URL + jobLink.trim();
            case JobAdSource.EURO_TECH_JOBS:
                return Constants.EURO_TECH_URL + jobLink.trim();
            case JobAdSource.GRADUATELAND:
                return Constants.GRADUATELAND_URL + jobLink.trim();
            case JobAdSource.JOB_FLUENT:
                return Constants.JOB_FLUENT_URL + jobLink.trim();
            case JobAdSource.LINKEDIN:
                const formattedLink = jobLink.trim().split(Constants.QUESTIONMARK_SIGN)[0];
                return formattedLink;
            case JobAdSource.NO_FLUFF_JOBS:
                return Constants.NO_FLUFF_JOBS_URL + jobLink.trim();
            case JobAdSource.QREER:
                return Constants.QREER_URL + jobLink.trim();
            case JobAdSource.SIMPLY_HIRED:
                return Constants.SIMPLY_HIRED_URL + jobLink.trim();
            case JobAdSource.TYBA:
                return Constants.TYBA_URL + jobLink.trim();
            case JobAdSource.WE_WORK_REMOTELY:
                return Constants.WE_WORK_REMOTELY_URL + jobLink.trim();
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
            case JobAdSource.LINKEDIN:
                scraperTracker.url = `https://www.linkedin.com/jobs/search?keywords=${urlParams.jobTitle}&location=${urlParams.location}&trk=public_jobs_jobs-search-bar_search-submit&pageNum=${scraperTracker.currentPage}`
                return Constants.LN_JOBLINKS_SELECTOR;
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

    /**
     * @description Based on adSource, this function returns selectors for collecting postedAgo information.
     * @param {JobAdSource} adSource
     * @returns {string} Returns a pair of selectors (jobCard, postedAgo).
     */
    private getPostedDateSelectors(adSource: JobAdSource): [string, string] {
        switch (adSource) {
            case JobAdSource.EURO_ENGINEER_JOBS:
            case JobAdSource.EURO_SCIENCE_JOBS:
            case JobAdSource.EURO_SPACE_CAREERS:
            case JobAdSource.EURO_TECH_JOBS:
                return [Constants.EURO_JOB_SITES_JOBCARD_SELECTOR, Constants.EURO_JOBS_POSTED_AGO_SELECTOR];
            case JobAdSource.JOB_FLUENT:
                return [Constants.JOB_FLUENT_JOBCARD_SELECTOR, Constants.JOB_FLUENT_POSTED_AGO_SELECTOR];
            case JobAdSource.LINKEDIN:
                return [Constants.LN_JOBCARD_SELECTOR, Constants.LINKEDIN_POSTED_AGO_SELECTOR];
            default:
                return [Constants.EMPTY_STRING, Constants.EMPTY_STRING];
        }
    }

    /**
     * @description Function accepts requested parameters from the client and jobAdSource.
     * Based on the parameters, the function constructs the euroJobSiteUrl which will be scraped for jobAds.
     * @param {AdScraperUrlParams} urlParams @param {JobAdSource} jobAdSource
     * @returns {string} Returns the element selector.
     */
    private getEuroJobSiteData(urlParams: AdScraperUrlParams, jobAdSource: JobAdSource): AdScraperTracker {
        const scraperTracker: AdScraperTracker = {
            nOfScrapedAds: 0,
            scrapedAds: [],
            currentPage: 1
        }

        switch (jobAdSource) {
            case JobAdSource.EURO_ENGINEER_JOBS:
                scraperTracker.url = `${Constants.EURO_ENGINEERING_URL}/job_search/keyword/${urlParams.jobTitle}`
            case JobAdSource.EURO_SCIENCE_JOBS:
                scraperTracker.url = `${Constants.EURO_SCIENCE_URL}/job_search/keyword/${urlParams.jobTitle}`
            case JobAdSource.EURO_SPACE_CAREERS:
                scraperTracker.url = `${Constants.EURO_SPACE_CAREERS_URL}/job_search/keyword/${urlParams.jobTitle}`
            case JobAdSource.EURO_TECH_JOBS:
                scraperTracker.url = `${Constants.EURO_TECH_URL}/job_search/keyword/${urlParams.jobTitle}`
        }

        return scraperTracker;
    }

    /**
     * @description Function maps scraped postedAgo entry to postedDate and posted timestamp, based on the scraped website.
     * The properties postedDate and postedTimestamp are then set for the JobAdDTO.
     * @param {JobAdDTO} jobAd @param {string} postedAgo @param {JobAdSource} jobAdSource
     * @returns {void}
     */
    private setPostedDate(jobAd: JobAdDTO, postedAgo: string, adSource: JobAdSource): void {
        switch (adSource) {
            case JobAdSource.JOB_FLUENT:
                jobAd.postedDate = this.utils.getPostedDate4JobFluent(postedAgo);
                break;
            case JobAdSource.LINKEDIN:
                jobAd.postedDate = this.utils.getPostedDate4LinkedIn(postedAgo);
                break;
            case JobAdSource.EURO_ENGINEER_JOBS:
            case JobAdSource.EURO_SCIENCE_JOBS:
            case JobAdSource.EURO_SPACE_CAREERS:
            case JobAdSource.EURO_TECH_JOBS:
                jobAd.postedDate = this.utils.getPostedDate4EuroJobSites(postedAgo);
                break;
        }

        jobAd.postedDateTimestamp = this.utils.transformToTimestamp(jobAd.postedDate!.toString())                        
    }

    /**
     * @description Function returns the ordered list of postedAgo values from the scraped website.
     * The list contains either postedAgo or null values (for job ads without postedAgo information).
     * @param {JobAdSource} adSource
     * @returns {Promise<(string | null)[]>} List of postedAgo/null values.
     */
    private async getPostedAgoList(adSource: JobAdSource): Promise<(string | null)[]> {
        let postedAgoList: (string | null)[] = [];
        const [jobCardSelector, postedAgoSelector] = this.getPostedDateSelectors(adSource);
        const jobCardElements = await this.browserAPI.findMultiple(jobCardSelector);
        for (let i = 0; i < jobCardElements.length; i++) {
            const postedAgoElem = await this.browserAPI.findElementOnElement(jobCardElements[i], postedAgoSelector);
            const postedAgo = postedAgoElem ? await this.browserAPI.getTextFromElement(postedAgoElem) : null;
            postedAgoList.push(postedAgo ? postedAgo.trim(): null);
        }
        return postedAgoList;
    }
}
