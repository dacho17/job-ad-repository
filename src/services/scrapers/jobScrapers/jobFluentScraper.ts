import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class JobFluentScraper implements IJobBrowserScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on JobFluent in the scrape is (jobTitle, companyName, companyLink, requiredSkills, companyInfo, jobDescription, isRemote, isInternship, timeEngagement).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_JOB_TITLE_SELECTOR);
        const timeEngagement = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_TIME_ENGAGEMENT_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const companyLocation = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_COMPANY_LOCATION_SELECTOR);
        const companyName = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_COMPANY_NAME_SELECTOR);
        const companyLink = await browserAPI.getDataSelectorAndAttr(Constants.JOB_FLUENT_DETAILS_COMPANY_LINK_SELECTOR, Constants.HREF_SELECTOR);
        const requiredSkills = await browserAPI.getDataSelectorAndAttr(Constants.JOB_FLUENT_DETAILS_REQUIRED_SKILLS_SELECTOR, Constants.CONTENT_SELECTOR);

        // check! parse companyDetails into its constituent properties
        // check! gather requiredskills

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: Constants.GRADUATELAND_URL + companyLink?.trim(),
            companyLocation: companyLocation?.trim(),
            requiredSkills: requiredSkills?.trim(),
            timeEngagement: timeEngagement?.trim()
        }
        
        const remotePositionElement = await browserAPI.findElement(Constants.JOB_FLUENT_DETAILS_REMOTE_SELECTOR);
        if (remotePositionElement) {
            newJob.isRemote = remotePositionElement !== null;
        }

        const isNotInternshipElement = await browserAPI.findElement(Constants.JOB_FLUENT_DETAILS_INTERNSHIP_SELECTOR);
        if (isNotInternshipElement) {
            newJob.isInternship = isNotInternshipElement === null;
        }

        await this.scrapeCompanyDetails(browserAPI, newJob);

        return newJob;
    }

    /**
   * @description Function which scrapes jobDetails part of the page, formats it and stores it into 
   * companyWebsite, companyIndustry, companyLocation, companySize, and companyFounded properties.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   */
    private async scrapeCompanyDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValues: string[] = [];
        const jobDetailsValueElements = await browserAPI.findElements(Constants.JOB_FLUENT_DETAILS_COMPANY_DETAILS_VALUES_SELECTOR);
        for (let i = 0; i < jobDetailsValueElements.length; i++) {
            const value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            jobDetailsValues.push(value!.trim());
        }
        
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.JOB_FLUENT_DETAILS_COMPANY_DETAILS_KEYS_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            switch(keyword!.trim()) {
                case Constants.WEBISTE:
                    newJob.companyWebsite = jobDetailsValues[i].trim()
                    break;
                case Constants.INDUSTRY:
                    newJob.companyIndustry = jobDetailsValues[i].trim();
                    break;
                case Constants.HEADQUARTERS:
                    newJob.companyLocation = jobDetailsValues[i].trim()
                    break;
                case Constants.COMPANY_SIZE:
                    newJob.companySize = jobDetailsValues[i].trim()
                    break;
                case Constants.FOUNDED:
                    newJob.companyFounded = jobDetailsValues[i].trim()
                    break;
            }
        }
    }
}
