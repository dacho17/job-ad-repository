import { Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import constants from "../../../helpers/constants";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class TybaScraper implements IJobBrowserScraper {
    /**
   * @description Function that accepts jobAd and browserAPI.
   * Data available on Tyba in the scrape is (jobTitle, organization.name, organization.urlReference, workLocation, timeEngagement, requiredSkills, requiredLanguages, and organization.industry).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        const jobTitle = await browserAPI.getText(Constants.TYBA_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }
        const orgNameElem = await browserAPI.findElement(Constants.TYBA_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const orgLink = await browserAPI.getDataFromAttr(orgNameElem!, Constants.HREF_SELECTOR)
        const orgName = await browserAPI.getTextFromElement(orgNameElem!);
        const jobDescription = await browserAPI.getText(Constants.TYBA_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            jobAdId: jobAd?.id ?? undefined,
            description: jobDescription?.trim(),
            organization: { name: orgName?.trim(), urlReference: orgLink ? Constants.TYBA_URL + orgLink.trim() : undefined } as OrganizationDTO,
        }

        await this.scrapeJobDetails(browserAPI, newJob);

        return newJob
    }

    /**
    * @description Function which scrapes jobDetails part of the page, formats it and stores it into the 
    * workLocation, timeEngagement, requiredSkills, requiredLanguages, and organization.industry properties.
    * @param {BrowserAPI} browserAPI
    * @param {JobDTO} newJob
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValueElements = await browserAPI.findElements(Constants.TYBA_DETAILS_JOB_DETAILS_VALUES_SELECTOR);

        const jobDetailsKeyElements = await browserAPI.findElements(Constants.TYBA_DETAILS_JOB_DETAILS_KEYS_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            if (!keyword) continue;
            let value;
            switch (keyword.trim()) {
                case Constants.LOCATION:
                    const valueElem = await browserAPI.findElementOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                    value = await browserAPI.getTextFromElement(valueElem!);
                    value = value?.split(Constants.WHITESPACE).map(part => part.trim()).join(Constants.EMPTY_STRING).trim();
                    newJob.workLocation = value!.replace(Constants.COMMA, Constants.COMPOSITION_DELIMITER);
                    break;
                case Constants.CATEGORY:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    newJob.organization.industry = value?.trim();
                    break;
                case Constants.TYPE:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    if (value) this.handleTimeEngagementProperty(newJob, value);
                    break;
                case Constants.SKILLS:
                    const valueElems = await browserAPI.findElementsOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                    let values = await Promise.all(valueElems.map(async elem => (await browserAPI.getTextFromElement(elem))?.trim()));
                    newJob.requiredSkills = values.filter(part => part !== Constants.EMPTY_STRING).join(Constants.COMPOSITION_DELIMITER);
                    break;
                case Constants.MUST_HAVE_LANGUAGE:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    console.log(value);
                    newJob.requiredLanguages = value?.replace(Constants.PROFESSIONAL, Constants.EMPTY_STRING).split(Constants.WHITESPACE).map(part => part.trim().replace(Constants.COMMA, constants.EMPTY_STRING))
                        .filter(part => part.length > 1).join(Constants.WHITESPACE);
                    break;
            }
        }
    }

    /**
   * @description Function which handles jobType value from the website, extracts information from it, and 
   * formats and stores the information to one of the job properties - timeEngagement, isInternship, isStudentPosition or details.
   * @param {JobDTO} newJob
   * @param {string} timeEngagement
   * @returns {void}
   */
    private handleTimeEngagementProperty(job: JobDTO, timeEngagement: string): void {
        switch (timeEngagement.trim().toLowerCase()) {
            case Constants.FULL_TIME:
                job.timeEngagement = Constants.FULL_TIME;
                break;
            case Constants.INTERNSHIP:
                job.isInternship = true;
                break;
            case Constants.PROJECT:
                job.timeEngagement = Constants.CONTRACT;
                break;
            case Constants.GRADUATE_PROGRAMME:
                job.isStudentPosition = true;
            default:
                job.details = timeEngagement
        }
    }
}
