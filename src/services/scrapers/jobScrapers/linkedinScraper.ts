import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import Utils from "../../../helpers/utils";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class LinkedInScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
     * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
     * Data available on Linkedin in the scrape is (jobTitle, companyName, companyLocation, companyLink, jobDescription, nOfApplicants, postedDate, ).
     * @param {number} jobAdId
     * @param {BrowserAPI} browserAPI
     * @returns {Promise<JobDTO>} Returns the a JobDTO.
     */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {

        const showMoreButton = await browserAPI.findElement(Constants.LN_DETAILS_SHOW_MORE_BUTTON_SELECTOR);
        if (showMoreButton) {
            console.log('show more button found')
            await showMoreButton.click();
        }

        console.log('after button click');

        const jobTitle = await browserAPI.getText(Constants.LN_DETAILS_JOBTITLE_SELECTOR);
        const companyName = await browserAPI.getText(Constants.LN_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const companyLink = await browserAPI.getDataSelectorAndAttr(Constants.LN_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR, Constants.HREF_SELECTOR)
        const companyLocation = await browserAPI.getText(Constants.LN_DETAILS_COMPANY_LOCATION_SELECTOR);
        const nOfApplicants = await browserAPI.getText(Constants.LN_DETAILS_NUMBER_OF_APPLICANTS_SELECTOR);
        let jobDescription = await browserAPI.getText(Constants.LN_DETAILS_JOB_DESCRIPTION_SELECTOR);
        const postedAgo = await browserAPI.getText(Constants.LN_DETAILS_POSTED_AGO_SELECTOR);

        jobDescription = jobDescription!
            .replace(Constants.SHOW_MORE, Constants.EMPTY_STRING)
            .replace(Constants.SHOW_LESS, Constants.EMPTY_STRING);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLocation: companyLocation?.trim(),
            companyLink: companyLink?.trim(),
            nOfApplicants: nOfApplicants?.trim(),
            postedDate: this.utils.getPostedDate4LinkedIn(postedAgo!.trim())
        }

        await this.scrapeJobCriteria(browserAPI, newJob);

        console.log(newJob);
        return newJob;
    }

    /**
     * @description Function that scrapes the 'criteria' section of a linkedin page, formats the scraped data and stores it on the newJob.
     * Properties set to the newJob are (requiredSkills, companyIndustry and timeEngagement).
     * @param {number} jobAdId
     * @param {BrowserAPI} browserAPI
     * @returns {Promise<JobDTO>} Returns the a JobDTO.
     */
    private async scrapeJobCriteria(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValues: string[] = [];
        const jobDetailsValueElements = await browserAPI.findElements(Constants.LN_DETAILS_JOB_CRITERIA_ITEM_VALUE_SELECTOR);
        for (let i = 0; i < jobDetailsValueElements.length; i++) {
            const value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            jobDetailsValues.push(value!.trim());
        }

        let jobRequirements = Constants.EMPTY_STRING;
        newJob.requiredSkills = Constants.EMPTY_STRING;
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.LN_DETAILS_JOB_CRITERIA_ITEM_KEY_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const jobCriteriaKey = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            const jobCriteriaVal = jobDetailsValues[i]; 
            switch(jobCriteriaKey?.trim()) {
                case Constants.INDUSTRIES:
                    newJob.companyIndustry = jobCriteriaVal;
                    break;
                case Constants.EMPLOYMENT_TYPE:
                    newJob.timeEngagement = jobCriteriaVal;
                    break;
                case Constants.SENIORITY_LEVEL:
                case Constants.JOB_FUNCTION:
                    jobRequirements += jobCriteriaVal + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
            }
        }

        newJob.requiredSkills = jobRequirements;
    }
}
