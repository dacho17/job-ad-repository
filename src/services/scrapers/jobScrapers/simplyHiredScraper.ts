import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class SimplyHiredScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on SimplyHired in the scrape is (jobTitle, organization.name, organization.location, timeEngagement, salary, postedDate, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {    
        const jobTitle = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_TITLE_SELECTOR);
        const orgName = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_COMPANY_NAME_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            organization: { name: orgName?.trim() } as OrganizationDTO
        }

        const orgLocation = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_COMPANY_LOCATION_SELECTOR);
        const timeEngagement = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_TIME_ENGAGEMENT_SELECTOR);
        const salary = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_SALARY_SELECTOR);
        newJob.organization.location = orgLocation?.trim();
        newJob.timeEngagement = timeEngagement?.trim();
        newJob.salary = salary?.trim();

        const postedAgo = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            const postedDate = this.utils.getPostedDate4SimplyHired(postedAgo.trim());
            newJob.postedDate = postedDate;
        }
        
        newJob.requiredSkills = await this.scrapeSimplyHiredListOfElements(Constants.SIMPLY_HIRED_DETAILS_JOB_REQUIRED_SKILLS_SELECTOR, browserAPI);
        newJob.benefits = await this.scrapeSimplyHiredListOfElements(Constants.SIMPLY_HIRED_DETAILS_JOB_BENEFITS_SELECTOR, browserAPI);

        return newJob;
    }

    /**
   * @description Function scrapes and formats part of the webiste determined by the passed selector.
   * Function then returns the resulting value.
   * @param {string} selector
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<string>}
   */
    private async scrapeSimplyHiredListOfElements(selector: string, browserAPI: BrowserAPI): Promise<string> {
        const requiredSkillElems = await browserAPI.findElements(selector);
        let requiredElements = await Promise.all(requiredSkillElems.map(async elem => (await browserAPI.getTextFromElement(elem))!.trim()));
        
        return requiredElements.join(Constants.COMMA + Constants.WHITESPACE);
    }
}
