import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class WeWorkRemotelyScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on WeWorkRemotely in the scrape is (jobTitle, companyName, companyLocation, companyWebiste, companyLink, postedAgo, nOfApplicants, jobDetails, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.WE_WORK_REMOTELY_DETAIL_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.WE_WORK_REMOTELY_JOB_DESCRIPTION_SELECTOR);
        const companyNameAndLinkElement = await browserAPI.findElement(Constants.WE_WORK_REMOTELY_COMPANY_NAME_AND_LINK_SELECTOR);

        const companyLink = await browserAPI.getDataFromAttr(companyNameAndLinkElement!, Constants.HREF_SELECTOR);
        const companyName = await browserAPI.getTextFromElement(companyNameAndLinkElement!);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: companyLink ? Constants.WE_WORK_REMOTELY_URL + companyLink.trim() : undefined
        }

        const companyWebsite = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_COMPANY_WEBSITE_SELECTOR, Constants.HREF_SELECTOR);
        const companyLocation = await browserAPI.getText(Constants.WE_WORK_REMOTELY_COMPANY_LOCATION_SELECTOR)
        const postedDate = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_POSTED_DATE_SELECTOR, Constants.DATETIME_SELECTOR);

        newJob.companyWebsite = companyWebsite?.trim();
        newJob.companyLocation = companyLocation?.trim();
        newJob.postedDate = postedDate ? new Date(postedDate.trim()) : undefined;
        
        await this.scrapeJobDetails(newJob, browserAPI);

        const numberOfApplicants = await browserAPI.getText(Constants.WE_WORK_REMOTELY_NUMBER_OF_APPLICANTS_SELECTOR);
        if (numberOfApplicants) {
            newJob.nOfApplicants = this.utils.getNumberOfApplicantsWWR(numberOfApplicants.trim());
        }

        return newJob;
    }

    /**
    * @description Function which scrapes JobDetails part of the page, formats it and stores it into 
    * isRemote, timeEngagement and details properties of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        let jobDetailElements = await browserAPI.findElements(Constants.WE_WORK_REMOTELY_JOB_DETAILS_SELECTOR);
        jobDetailElements.shift(); jobDetailElements.shift();  // first two elements of the list are irrelevant
        let jobDetails = Constants.EMPTY_STRING;
        for (let i = 0; i < jobDetailElements.length; i++) {
            let jobDetail = await browserAPI.getTextFromElement(jobDetailElements[i]);
            jobDetail = jobDetail!.trim();
            switch(jobDetail) {
                case Constants.ANYWHERE_IN_THE_WORLD:
                    newJob.isRemote = true;
                    break;
                case Constants.FULL_TIME:
                    newJob.timeEngagement = Constants.FULL_TIME;
                    break;
                default:
                    jobDetails += jobDetail + Constants.COMMA + Constants.WHITESPACE;
            }
        }

        newJob.details = jobDetails;
    }
}
