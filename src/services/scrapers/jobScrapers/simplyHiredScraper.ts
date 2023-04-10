import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
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
   * @description Function that accepts jobAd and browserAPI.
   * Data available on SimplyHired in the scrape is (jobTitle, organization.name, organization.location,
   * timeEngagement, salary, postedDate, benefits, requiredExperience, requiredSkills, requiredEducation jobDescription).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {    
        const jobTitle = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }
        const orgName = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_COMPANY_NAME_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription?.trim(),
            jobAdId: jobAd?.id ?? undefined,
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
        this.handleRequiredExpEduSkills(newJob, reqSkill);
        newJob.benefits = (await this.scrapeSimplyHiredListOfElements(Constants.SIMPLY_HIRED_DETAILS_JOB_BENEFITS_SELECTOR, browserAPI)).join(Constants.COMPOSITION_DELIMITER);

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
     * extracts requiredExperience, requiredSkills, and requiredEducation, and stores it into the new newJob properties.
     * @param {JobDTO} newJob
     * @param {string[]} requiredExperience
     * @returns {void}
     */
    private handleRequiredExpEduSkills(newJob: JobDTO, requiredExperience: string[]): void {
        let reqExpSol = new Set();
        let reqEdu = new Set();
        let reqSkills = new Set();
        requiredExperience.forEach(elem => {
            const elemParts = elem.split(Constants.WHITESPACE).map(el => el.toLowerCase());
            if (elem.toLowerCase().indexOf(Constants.BACHELOR) !== -1) {
                reqEdu.add(Constants.BACHELOR);
            } else if (elem.toLowerCase().indexOf(Constants.MASTER) !== -1) {
                reqEdu.add(Constants.MASTER);
            } else if (elem.toLowerCase().indexOf(Constants.PHD) !== -1 || elemParts.includes(Constants.DOCTOR)) {
                reqEdu.add(Constants.PHD);
            } else if (elemParts.length > 1) {
                const [firstPart, secondPart, _] = elemParts;
                const firstPartNum = parseInt(firstPart);
                const secondPartNum = parseInt(secondPart);
                if (firstPartNum || secondPartNum) {
                    const yearsSuf = (num: number) => num === 1 ? Constants.YEAR : Constants.YEARS;
                    if (firstPart === 'Under' && !isNaN(secondPartNum)) reqExpSol.add(`Less than ${secondPart} ${yearsSuf(secondPartNum)}`);
                    if (!isNaN(firstPartNum)) reqExpSol.add(`At least ${firstPart} ${yearsSuf(firstPartNum)}`)
                    
                    const plusIndex = firstPart.indexOf(Constants.PLUS_SIGN);
                    if (plusIndex !== -1) {
                        const years = firstPart.substring(0, plusIndex);
                        reqExpSol.add(`More than ${years} ${yearsSuf(parseInt(years))}`);
                    }
                } else {
                    reqSkills.add(elem);    
                }
            } else {
                reqSkills.add(elem);
            }
        });

        newJob.requiredSkills = Array.from(reqSkills.values()).join(Constants.COMPOSITION_DELIMITER);
        newJob.requiredEducation = Array.from(reqEdu.values()).join(Constants.COMPOSITION_DELIMITER);
        newJob.requiredExperience = Array.from(reqExpSol.values()).join(Constants.COMPOSITION_DELIMITER);
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
        
        newJob.timeEngagement = timeEngagements.join(Constants.COMPOSITION_DELIMITER);
    }
}
