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
   * Data available on SimplyHired in the scrape is (jobTitle, organization.name, organization.location, timeEngagement, salary, postedDate, benefits, requiredSkills, jobDescription).
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
        this.handleTimeEngagement(newJob, timeEngagement);
        newJob.salary = salary?.trim();

        const postedAgo = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            const postedDate = this.utils.getPostedDate4SimplyHired(postedAgo.trim());
            newJob.postedDate = postedDate;
        }
        
        const reqSkill = await this.scrapeSimplyHiredListOfElements(Constants.SIMPLY_HIRED_DETAILS_JOB_REQUIRED_SKILLS_SELECTOR, browserAPI);
        this.handleRequiredExperience(newJob, reqSkill);
        newJob.requiredSkills = reqSkill.join(Constants.COMMA + Constants.WHITESPACE);
        newJob.benefits = (await this.scrapeSimplyHiredListOfElements(Constants.SIMPLY_HIRED_DETAILS_JOB_BENEFITS_SELECTOR, browserAPI)).join(Constants.COMMA + Constants.WHITESPACE);

        return newJob;
    }

    /**
   * @description Function scrapes and formats part of the webiste determined by the passed selector.
   * Function then returns the resulting value.
   * @param {string} selector
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<string>}
   */
    private async scrapeSimplyHiredListOfElements(selector: string, browserAPI: BrowserAPI): Promise<string[]> {
        const requiredSkillElems = await browserAPI.findElements(selector);
        let requiredElements = await Promise.all(requiredSkillElems.map(async elem => (await browserAPI.getTextFromElement(elem))!.trim()));
        
        return requiredElements;
    }

    /**
     * @description Function that handles the collected required skills from SimplyHired,
     * extracts required experience, and stores it into the new newJob property.
     * @param {JobDTO} newJob
     * @param {string[]} requiredExperience
     * @returns {void}
     */
    private handleRequiredExperience(newJob: JobDTO, requiredExperience: string[]): void {
        let reqExpSol: string[] = [];
        requiredExperience.forEach(elem => {
            const elemParts = elem.split(Constants.WHITESPACE);
            if (elemParts.length > 1) {
                const [firstPart, secondPart, _] = elemParts;
                const firstPartNum = parseInt(firstPart);
                const secondPartNum = parseInt(secondPart);
                const yearsSuf = (num: number) => num === 1 ? 'year' : 'years';
                if (firstPart === 'Under' && !isNaN(secondPartNum)) reqExpSol.push(`Less than ${secondPart} ${yearsSuf(secondPartNum)}`);
                if (!isNaN(firstPartNum)) reqExpSol.push(`At least ${firstPart} ${yearsSuf(firstPartNum)}`)
                
                const plusIndex = firstPart.indexOf(Constants.PLUS_SIGN);
                if (plusIndex !== -1) {
                    const years = firstPart.substring(0, plusIndex);
                    reqExpSol.push(`More than ${years} ${yearsSuf(parseInt(years))}`);
                }
            }
        });

        newJob.requiredExperience = reqExpSol.join(Constants.COMMA + Constants.WHITESPACE);
    }

    /**
     * @description Function that sets timeManagement and isInternship properties.
     * @param {JobDTO} newJob
     * @param {string | null} timeEngagement
     * @returns {void}
     */
    private handleTimeEngagement(newJob: JobDTO, timeEngagement: string | null): void {
        if (!timeEngagement) return;

        let timeEngagements = [];
        const timeEngagementValues = timeEngagement.split(Constants.PIPE);
        for (let i = 0; i < timeEngagementValues.length; i++) {
            let value = timeEngagementValues[i].trim().toLowerCase();
            switch (value) {
                case Constants.FULL_TIME:
                case Constants.CONTRACT:
                case Constants.PERMANENT:
                case Constants.SEASONAL:
                    timeEngagements.push(value);
                    break;
                case Constants.INTERNSHIP:
                    newJob.isInternship = true;
                    break;
            }
        }
        
        newJob.timeEngagement = timeEngagements.join(Constants.COMMA + Constants.WHITESPACE);
    }
}
