import Container, { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import Utils from "../../../helpers/utils";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import constants from "../../../helpers/constants";
import { JobAd } from "../../../database/models/jobAd";

@Service()
export default class LinkedInScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
    * @description Function that accepts jobAd and browserAPI.
     * Data available on Linkedin in the scrape is (jobTitle, organization.name, organization.location, organization.urlReference, organization.industry, jobDescription, nOfApplicants, postedDate, requiredExperience, details, timeEngagement).
     * @param {JobAd | null} jobAd
     * @param {BrowserAPI} browserAPI
     * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
     */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {

        const showMoreButton = await browserAPI.findElement(Constants.LN_DETAILS_SHOW_MORE_BUTTON_SELECTOR);
        if (showMoreButton) {
            console.log('show more button found')
            await showMoreButton.click();
        }

        const jobTitle = await browserAPI.getText(Constants.LN_DETAILS_JOBTITLE_SELECTOR);
        if (!jobTitle) {
            jobAd!.isAdPresentOnline = false;
            return null;
        }
        const orgName = await browserAPI.getText(Constants.LN_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const orgUrlRef = await browserAPI.getDataSelectorAndAttr(Constants.LN_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR, Constants.HREF_SELECTOR)
        const orgLocation = await browserAPI.getText(Constants.LN_DETAILS_COMPANY_LOCATION_SELECTOR);
        const nOfApplicants = await browserAPI.getText(Constants.LN_DETAILS_NUMBER_OF_APPLICANTS_SELECTOR);

        await browserAPI.waitForSelector('DUMMY', 5000);
        let jobDescription = await browserAPI.getText(Constants.LN_DETAILS_JOB_DESCRIPTION_SELECTOR);
        if (!jobDescription) {
            await browserAPI.waitForSelector(Constants.LN_DETAILS_JOB_DESCRIPTION_SELECTOR, 1000);
            jobDescription = await browserAPI.getText(Constants.LN_DETAILS_JOB_DESCRIPTION_VAR_1_SELECTOR);
        }
        if (!jobDescription) {
            await browserAPI.waitForSelector(Constants.LN_DETAILS_JOB_DESCRIPTION_SELECTOR, 1000);
            jobDescription = await browserAPI.getText(Constants.LN_DETAILS_JOB_DESCRIPTION_VAR_2_SELECTOR);
        }

        const postedAgo = await browserAPI.getText(Constants.LN_DETAILS_POSTED_AGO_SELECTOR);

        jobDescription = jobDescription!
            .replace(Constants.SHOW_MORE, Constants.EMPTY_STRING)
            .replace(Constants.SHOW_LESS, Constants.EMPTY_STRING);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription!.trim(),
            jobAdId: jobAd?.id ?? undefined,
            organization: { name: orgName?.trim(), location: orgLocation?.trim(), urlReference: orgUrlRef?.trim() } as OrganizationDTO,
            nOfApplicants: this.formatNofApplicants(nOfApplicants?.trim()) ?? undefined,
            postedDate: this.utils.getPostedDate4LinkedIn(postedAgo!.trim())
        }

        await this.scrapeJobCriteria(browserAPI, newJob);

        console.log(newJob);
        return newJob;
    }

    /**
     * @description Function that scrapes the 'criteria' section of a linkedin page, formats the scraped data and stores it on the newJob.
     * Properties set to the newJob are (requiredExperience, details, organization.industry and timeEngagement).
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

        newJob.requiredSkills = Constants.EMPTY_STRING;
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.LN_DETAILS_JOB_CRITERIA_ITEM_KEY_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const jobCriteriaKey = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            const jobCriteriaVal = jobDetailsValues[i]; 
            switch(jobCriteriaKey?.trim()) {
                case Constants.INDUSTRIES:
                    newJob.organization.industry = jobCriteriaVal;
                    break;
                case Constants.EMPLOYMENT_TYPE:
                    if (jobCriteriaVal) this.handleEmploymentTypeValue(newJob, jobCriteriaVal);
                    break;
                case Constants.SENIORITY_LEVEL:
                    if (jobCriteriaVal) this.handleSeniorityLevelValue(newJob, jobCriteriaVal);
                    break;
                case Constants.JOB_FUNCTION:
                    newJob.details = jobCriteriaVal;
                    break;
            }
        }
    }

    /**
     * @description Function that handles the employmentType value from linkedin job site, formats its value,
     * and stores it into one of the newJob properties: timeEngagement or isInternship.
     * @param {JobDTO} newJob
     * @param {string} employmentType
     * @returns {void}
     */
    private handleEmploymentTypeValue(newJob: JobDTO, employmentType: string) : void {
        switch (employmentType.toLowerCase()) {
            case Constants.FULL_TIME:
                newJob.timeEngagement = Constants.FULL_TIME;
                break;
            case Constants.CONTRACT:
                newJob.timeEngagement = Constants.CONTRACT;
                break;
            case Constants.INTERNSHIP:
                newJob.isInternship = true;
                break;
            case Constants.OTHER:
                break;
        }
    }

        /**
     * @description Function that handles the seniorityLevel value from linkedin job site, formats its value,
     * and stores it into one of the newJob properties: isInternship or requiredExperience.
     * @param {JobDTO} newJob
     * @param {string} seniorityLevel
     * @returns {void}
     */
    private handleSeniorityLevelValue(newJob: JobDTO, seniorityLevel: string) : void {
        switch (seniorityLevel.toLowerCase()) {
            case Constants.INTERNSHIP:
                newJob.isInternship = true;
                break;
            case Constants.ENTRY_LEVEL:
            default:
                newJob.requiredSkills = newJob.requiredSkills 
                    ? newJob.requiredSkills + Constants.COMMA + Constants.WHITESPACE + seniorityLevel
                    : seniorityLevel;
                newJob.requiredExperience = newJob.requiredExperience
                    ? newJob.requiredExperience + Constants.COMMA + Constants.WHITESPACE + seniorityLevel
                    : seniorityLevel;
        }
    }

    private formatNofApplicants(nOfApplicants?: string): string | null {
        if (!nOfApplicants) return null;
        const partsOfStr = nOfApplicants.split(Constants.WHITESPACE);

        let candidateNum = parseInt(partsOfStr[0]);
        if (!isNaN(candidateNum)) return partsOfStr[0];

        candidateNum = parseInt(partsOfStr[1]);
        if (!isNaN(candidateNum)) return `Over ${partsOfStr[1]}`;

        candidateNum = parseInt(partsOfStr[4]);
        if (!isNaN(candidateNum)) return `Less than ${partsOfStr[4]}`;

        return Constants.UNKNOWN;
    }
}
