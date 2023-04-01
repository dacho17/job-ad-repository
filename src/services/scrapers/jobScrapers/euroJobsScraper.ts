import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobScraper from "../interfaces/IJobScraper";

@Service()
export default class EuroJobsScraper implements IJobScraper {
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
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {    
        const jobTitle = await browserAPI.getText(Constants.EURO_JOBS_DETAILS_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.EURO_JOBS_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: Constants.UNDISLOSED_COMPANY,  // set as a default value
        }

        await this.scrapeJobDetails(newJob, browserAPI);

        return newJob;
    }

    /**
   * @description Function which looks to scrape companuName, companyLocation, euWorkPermit, postedDate and deadline,
   * The function also sets details property as a composition of all the properties mentioned above and some additional ones.
   * @param {JobDTO} newJob
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the JobDTO.
   */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        let details = '';
        const jobDetailsKeysElement = await browserAPI.findElements(Constants.EURO_JOBS_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        const jobDetailsValuesElement = await browserAPI.findElements(Constants.EURO_JOBS_DETAILS_JOB_DETAILS_VALUE_SELECTOR);
        for (let i = 0; i < jobDetailsKeysElement.length; i++) {
            const key = await browserAPI.getTextFromElement(jobDetailsKeysElement[i]);
            const value = await browserAPI.getTextFromElement(jobDetailsValuesElement[i]);
            switch (key?.trim()) {
                case Constants.CLIENT:
                    newJob.companyName = value?.trim() || newJob.companyName;
                    break;
                case Constants.LOCATION:
                    newJob.companyLocation = value?.trim();
                    break;
                case Constants.EU_WORK_PERMIT_REQ:
                    newJob.euWorkPermitRequired = value?.trim() === Constants.YES;
                    break;
                case Constants.POSTED:
                    newJob.postedDate = this.utils.getDateFromDottedDateString(value);
                    break;
                case Constants.EXPIRY_DATE:
                    newJob.deadline = this.utils.getDateFromDottedDateString(value);
                    break;
            }

            details += key + Constants.EQUALS + value + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
        }
        newJob.details = details;
    }
}
