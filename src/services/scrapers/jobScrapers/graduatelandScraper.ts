import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class GraduatelandScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
      * @description Function that accepts jobAd and browserAPI.
   * Data available on Graduateland in the scrape is (jobTitle, jobDescription, orgName, orgUrlRef, postedDate, workLocation, timeEngagement, requiredSkills, requiredLanguages, and organization.orgIndustry).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        const jobTitle = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }

        const jobDescription = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const orgNameElement = await browserAPI.findElement(Constants.GRADUATELAND_DETAILS_COMPANY_NAME_SELECTOR);
        let orgName, orgUrlRef;
        if (orgNameElement) {
            orgUrlRef = await browserAPI.getDataFromAttr(orgNameElement, Constants.HREF_SELECTOR);
            orgName = await browserAPI.getTextFromElement(orgNameElement);
        }

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription?.trim(),
            jobAdId: jobAd?.id ?? undefined,
            organization: {
                name: orgName?.trim(),
                urlReference: orgUrlRef ? Constants.GRADUATELAND_URL + orgUrlRef.trim() : undefined
            } as OrganizationDTO,
        }

        const postedAgo = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4Graduateland(postedAgo.trim());
        }

        await this.scrapeJobDetails(browserAPI, newJob);
        return newJob;
    }

     /**
   * @description Function which scrapes jobDetails part of the page, formats it and stores it into the
   * workLocation, timeEngagement, requiredSkills, requiredLanguages, and organization.orgIndustry properties.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValueElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_VALUES_SELECTOR);
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            if (!jobDetailsKeyElements[i] || !jobDetailsValueElements[i]) continue;
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            if (!keyword) continue;
            let value, valueElems, values;
            try {
                switch(keyword.trim()) {
                    case Constants.LOCATION:
                        const valueElem = await browserAPI.findElementOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                        value = await browserAPI.getTextFromElement(valueElem!);
                        value = value!.split(Constants.WHITESPACE).map(part => part.trim()).join(Constants.EMPTY_STRING).trim();
                        newJob.workLocation = value!.replace(Constants.COMMA, Constants.COMPOSITION_DELIMITER);
                        break;
                    case Constants.CATEGORY:
                        valueElems = await browserAPI.findElementsOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                        values = await Promise.all(valueElems.map(async elem => (await browserAPI.getTextFromElement(elem))?.trim()));
                        newJob.organization.industry = values.filter(part => part && part.length > 1).join(Constants.COMPOSITION_DELIMITER);
                        break;
                    case Constants.TYPE:
                        value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                        if (value) this.handleTimeEngagementProperty(newJob, value);
                        break;
                    case Constants.SKILLS:
                        valueElems = await browserAPI.findElementsOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                        values = await Promise.all(valueElems.map(async elem => (await browserAPI.getTextFromElement(elem))?.trim()));
                        newJob.requiredSkills = values.filter(part => part && part.length > 1).join(Constants.COMPOSITION_DELIMITER);
                        break;
                    case Constants.MUST_HAVE_LANGUAGE:
                        value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                        newJob.requiredLanguages = value?.replace(Constants.PROFESSIONAL, Constants.EMPTY_STRING)
                            .split(Constants.WHITESPACE).map(part => part.trim()
                            .replace(Constants.COMMA, Constants.EMPTY_STRING))
                            .filter(part => part.length > 1).join(Constants.WHITESPACE);
                        break;
                }
            } catch (err) {
                console.log(`Error occurred while handling value setting for keyword=${keyword} on Graduateland.`);
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
