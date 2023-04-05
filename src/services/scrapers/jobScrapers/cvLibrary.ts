import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

// IMPORTANT NOTE: CvLibrary is not a uniform-job-format website. This scraper will be able to scrape only some jobs.
@Service()
export default class CvLibraryScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on CvLibrary in the scrape is (jobTitle, orgName, workLocation, isRemote, salary, timeEngagement, startDate, postedDate, jobDetails, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.CV_LIBRARY_DETAILS_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.CV_LIBRARY_DETAILS_JOB_DESCRIPTION_SELECTOR);
        const orgName = await browserAPI.getText(Constants.CV_LIBRARY_DETAILS_COMPANY_NAME_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            organization: { name: orgName?.trim() } as OrganizationDTO,
            jobAdId: jobAdId ?? undefined,
        }

        const postedAgo = await browserAPI.getText(Constants.CV_LIBRARY_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4CvLibrary(postedAgo.trim());
        }

        const remoteJobElement = await browserAPI.findElement(Constants.CV_LIBRARY_DETAILS_REMOTE_POSITION_SELECTOR);
        if (remoteJobElement) {
            newJob.isRemote = true;
        }

        await this.scrapeJobDetails(browserAPI, newJob);

        return newJob;
    }

    /**
   * @description Function scrapes and formats jobDetails section of the page. After formatting,
   * the properties salary, workLocation, timeEngagement and startDate of JobDTO are set.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   * 
   */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.CV_LIBRARY_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        const jobDetailsValueElements = await browserAPI.findElements(Constants.CV_LIBRARY_DETAILS_JOB_DETAILS_VALUE_SELECTOR);

        // first scraping workLocation and salary (of present) as they are on separate part of the page
        const workLocation = await browserAPI.getTextFromElement(jobDetailsValueElements[0]);
        newJob.workLocation = workLocation?.trim();
        
        const salaryCandidate = await browserAPI.getTextFromElement(jobDetailsValueElements[1]);
        if (/\d/.test(salaryCandidate || Constants.EMPTY_STRING)) {
            newJob.salary = salaryCandidate!.trim();
        }

        for (let i = 2; i < jobDetailsKeyElements.length; i++) {
            if (!jobDetailsKeyElements[i] || !jobDetailsValueElements[i]) continue;

            let title = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            let value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            title = title!.trim();
            value = value!.trim();
            
            switch(title) {
                case Constants.TYPE_COL:
                    newJob.timeEngagement = value.trim();
                    break;
                case Constants.START_DATE_COL:
                    newJob.startDate = this.utils.getStartDate4CvLibrary(value.trim())
                    break;
            }
        }
    }
}
