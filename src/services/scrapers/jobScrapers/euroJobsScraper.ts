import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class EuroJobsScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on EuroJobs in the scrape is (jobTitle, companyLocation, companyName, postedDate, jobDescription).
   * Information - EUworkPermitRequired, jobViews, applicationDeadline are on the page as well.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {    
        const jobTitle = await browserAPI.getText(Constants.EURO_JOBS_DETAILS_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.EURO_JOBS_DETAILS_JOB_DESCRIPTION_SELECTOR);
        const companyName = await browserAPI.getText(Constants.EURO_JOBS_DETAILS_COMPANY_NAME_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
        }
        
        const companyWebsite = await browserAPI.getDataSelectorAndAttr(Constants.EURO_JOBS_DETAILS_COMPANY_WEBSITE_SELECTOR, Constants.HREF_SELECTOR);
        newJob.companyWebsite = companyWebsite?.trim();

        await this.scrapeJobDetails(newJob, browserAPI);
        await this.scrapeRequirementsAndEngagement(newJob, browserAPI);

        return newJob;
    }

    /**
   * @description Function which looks to scrape companyName, companyLocation, euWorkPermit, postedDate and deadline,
   * The function also sets details property as a composition of all the properties mentioned above and some additional ones.
   * @param {JobDTO} newJob
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobDetailsKeysElement = await browserAPI.findElements(Constants.EURO_JOBS_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        const jobDetailsValuesElement = await browserAPI.findElements(Constants.EURO_JOBS_DETAILS_JOB_DETAILS_VALUE_SELECTOR);
        for (let i = 0; i < jobDetailsKeysElement.length; i++) {
            const key = await browserAPI.getTextFromElement(jobDetailsKeysElement[i]);
            const value = await browserAPI.getTextFromElement(jobDetailsValuesElement[i]);
            switch (key?.trim()) {
                case Constants.CLIENT_COL:
                    newJob.companyName = value?.trim() || newJob.companyName;
                    break;
                case Constants.LOCATION_COL:
                    newJob.companyLocation = value?.trim();
                    break;
                case Constants.EU_WORK_PERMIT_REQ_COL:
                    newJob.euWorkPermitRequired = value?.trim() === Constants.YES;
                    break;
                case Constants.POSTED_COL:
                    newJob.postedDate = this.utils.getDateFromDottedDateString(value);
                    break;
                case Constants.EXPIRY_DATE_COL:
                    newJob.deadline = this.utils.getDateFromDottedDateString(value);
                    break;
            }
        }
    }

    /**
   * @description Function which looks to scrape requirements and timeEngagement from the page.
   * The function also sets those properties to the newJob.
   * @param {JobDTO} newJob
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeRequirementsAndEngagement(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const engagementAndRequirementsElems = await browserAPI.findElements(Constants.EURO_JOBS_DETAILS_ENGAGEMENT_AND_REQUIREMENTS_SELECTOR);
        console.log(`Elements found = ${engagementAndRequirementsElems.length}`)
        engagementAndRequirementsElems.shift(); // fist element is jobDescription already scraped elsewhere in the class
        for (let i = 0; i < engagementAndRequirementsElems.length; i++) {
            const titleElem = await browserAPI.findElementOnElement(engagementAndRequirementsElems[i], Constants.H3_SELECTOR);
            const valueElem = await browserAPI.findElementOnElement(engagementAndRequirementsElems[i], Constants.DIV_SELECTOR);
            if (!titleElem || !valueElem) continue;

            let title = await browserAPI.getTextFromElement(titleElem);
            let value = await browserAPI.getTextFromElement(valueElem);

            console.log(`Title=${title},value=${value}`);

            switch(title?.trim()) {
                case Constants.JOB_REQUIREMENTS_COL:
                    newJob.requirements = value?.trim();
                    break;
                case Constants.EMPLOYMENT_TYPE_COL:
                    newJob.timeEngagement = value?.trim();
                    break;
            }
        }
    }
}
