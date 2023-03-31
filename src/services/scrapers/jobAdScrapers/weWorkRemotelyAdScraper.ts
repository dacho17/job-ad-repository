import { ElementHandle } from "puppeteer";
import { Inject, Service } from "typedi";
import Constants from '../../../helpers/constants';
import { AdScraperTracker } from "../../../helpers/dtos/adScraperTracker";
import { JobAdDTO } from "../../../helpers/dtos/jobAdDTO";
import { ScrapeJobAdsForm } from "../../../helpers/dtos/scrapeJobAdsForm";
import { JobAdSource } from "../../../helpers/enums/jobAdSource";
import IJobAdScraper from "../interfaces/IJobAdScraper";
import { BaseAdScraper } from "./baseAdScraper";


@Service()
export class WeWorkRemotelyAdScraper extends BaseAdScraper implements IJobAdScraper {
    /**
   * @description Function that accepts client form, and based on it starts the jobAd scraping.
   * Data available on WeWorkRemotely in the scrape is (jobTitle, companyName, companyLocation, timeEngagement).
   * Only jobLink is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    public async scrape(_: ScrapeJobAdsForm): Promise<JobAdDTO[]> {
        const url = `${Constants.WE_WORK_REMOTELY_URL}/remote-jobs/`;
        await this.browserAPI.run();
        await this.browserAPI.openPage(url);

        const [allJobSections, sectionsToBeScrapedFromMain, seeMoreUrls] = await this.divideIntoMainAndSeeMorePages();
        const scraperTracker: AdScraperTracker = {
            nOfScrapedAds: 0,
            scrapedAds: [],
            currentPage: 1
        }
        for (let i = 0; i < sectionsToBeScrapedFromMain.length; i++) {
            const jobAdElements = await this.browserAPI.findElementsOnElement(allJobSections[sectionsToBeScrapedFromMain[i]], Constants.WE_WORK_REMOTELY_JOBLINKS_SELECTOR);
            await this.scrapeJobAdElements(scraperTracker, JobAdSource.WE_WORK_REMOTELY, jobAdElements, []);            
        }
        console.log(scraperTracker.scrapedAds.length + " jobs have been found on the main page");
    
        console.log("starting to scrape separate pages");
        for (let i = 0; i < seeMoreUrls.length; i++) {
            await this.browserAPI.openPage(seeMoreUrls[i]);
            const jobAdElements = await this.browserAPI.findMultiple(Constants.WE_WORK_REMOTELY_JOBLINKS_SELECTOR_TWO); // not the first and the last one
            jobAdElements.shift();
            jobAdElements.pop();
            await this.scrapeJobAdElements(scraperTracker, JobAdSource.WE_WORK_REMOTELY, jobAdElements, []);
        }
    
        console.log(scraperTracker.scrapedAds.length + " jobs have been scraped in total.");
    
        await this.browserAPI.close();
        return scraperTracker.scrapedAds;
    }

     /**
   * @description Function returns a triplet.
   * 1. An array of element handles for each of the job sections on the main page.
   * 2. An array containing indices of sections which are to be scraped from main.
   * 3. Urls of pages which need to be visisted and scraped ('see more ads' pages) other than the main page.
   * Data available on WeWorkRemotely in the scrape is (jobTitle, companyName, companyLocation, timeEngagement).
   * Only jobLink is scraped at the moment since rest of the data is available on the job detail site.
   * @param {ScrapeJobAdsForm} clientForm
   * @returns {Promise<JobAdDTO[]>} Returns the list of scraped JobAdDTOs.
   */
    private async divideIntoMainAndSeeMorePages(): Promise<[ElementHandle<Element>[], number[], string[]]> {
        // scrape directly from the main page those who do not have .view-all. Otherwise access the separate urls and scrape from there
        const showAllJobsUrls: string[] = [];
        const jobSectionElements = await this.browserAPI.findMultiple(Constants.WE_WORK_REMOTELY_JOB_SECTION_SELECTOR);
        const sectionsToBeScrapedFromMain: number[] = [];
        for (let i = 0; i < jobSectionElements.length; i++) {
            const jobUrlElement = await jobSectionElements[i].$(Constants.WE_WORK_REMOTELY_VIEW_ALL_JOBS_SELECTOR);
            if (jobUrlElement === null) {
                sectionsToBeScrapedFromMain.push(i);
                continue;
            }
            const newUrl = Constants.WE_WORK_REMOTELY_URL + await this.browserAPI.getDataFromAttr(jobUrlElement, Constants.HREF_SELECTOR);
            showAllJobsUrls.push(newUrl.trim());
        }
        console.log(showAllJobsUrls.length + " additional job pages will be scraped.");     // scraping the pages other than the main one (the ones with higher number of ads)
        const allJobSections = await this.browserAPI.findMultiple(Constants.WE_WORK_REMOTELY_JOB_SECTION_SELECTOR);
        
        return [allJobSections, sectionsToBeScrapedFromMain, showAllJobsUrls];
    }
}
