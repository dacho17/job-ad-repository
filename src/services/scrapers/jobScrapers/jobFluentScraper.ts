import { Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class JobFluentScraper implements IJobBrowserScraper {
    /**
      * @description Function that accepts jobAd and browserAPI.
   * Data available on JobFluent in the scrape is (jobTitle, timeEngagement, jobDescription, requiredSkills, isRemote, isInternship, organization.name, organization.urlReference, organization.website, organization.industry, organization.location, organization.size, and organization.founded properties ).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        const jobTitle = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }
        const timeEngagement = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_TIME_ENGAGEMENT_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const orgLocation = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_COMPANY_LOCATION_SELECTOR);
        const orgName = await browserAPI.getText(Constants.JOB_FLUENT_DETAILS_COMPANY_NAME_SELECTOR);
        const orgUrlRef = await browserAPI.getDataSelectorAndAttr(Constants.JOB_FLUENT_DETAILS_COMPANY_LINK_SELECTOR, Constants.HREF_SELECTOR);
        const requiredSkills = await browserAPI.getDataSelectorAndAttr(Constants.JOB_FLUENT_DETAILS_REQUIRED_SKILLS_SELECTOR, Constants.CONTENT_SELECTOR);
        
        const salary = await browserAPI.findElements(Constants.JOB_FLUENT_DETAILS_SALARY_SELECTOR);
        let compositeSalary: string | undefined;
        if (salary && salary.length === 2) {
            let minSalaryVal = await browserAPI.getTextFromElement(salary[0]);
            let maxSalaryVal = await browserAPI.getTextFromElement(salary[1]);
            if (minSalaryVal && maxSalaryVal) {
                compositeSalary = minSalaryVal.trim() + Constants.MINUS_SIGN + maxSalaryVal.trim() 
                    + Constants.WHITESPACE + Constants.EUR.toUpperCase() + Constants.SLASH + Constants.YEAR;
            }
        }

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription?.trim(),
            jobAdId: jobAd?.id ?? undefined,
            organization: { name: orgName?.trim(), location: orgLocation?.trim(), urlReference: orgUrlRef?.trim() } as OrganizationDTO,
            requiredSkills: requiredSkills?.trim(),
            timeEngagement: timeEngagement?.trim().toLowerCase(),
            salary: compositeSalary,
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
   * organization.website, organization.industry, organization.location, organization.size, and organization.founded properties.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   */
    private async scrapeCompanyDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValues: string[] = [];
        const jobDetailsValueElements = await browserAPI.findElements(Constants.JOB_FLUENT_DETAILS_COMPANY_DETAILS_VALUES_SELECTOR);
        for (let i = 0; i < jobDetailsValueElements.length; i++) {
            const value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            if (value) jobDetailsValues.push(value.trim());
        }
        
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.JOB_FLUENT_DETAILS_COMPANY_DETAILS_KEYS_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            let value = jobDetailsValues[i];
            if (!keyword || !value) continue;
            switch(keyword!.trim()) {
                case Constants.WEBISTE:
                    newJob.organization.website = value;
                    break;
                case Constants.INDUSTRY:
                    newJob.organization.industry = value;
                    break;
                case Constants.HEADQUARTERS:
                    newJob.organization.location = value;
                    break;
                case Constants.COMPANY_SIZE:
                    newJob.organization.size = value;
                    break;
                case Constants.FOUNDED:
                    newJob.organization.founded = value;
                    break;
            }
        }
    }
}
