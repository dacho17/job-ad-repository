import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class SimplyHiredScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on SimplyHired in the scrape is (jobTitle, companyName, companyLocation, timeEngagement, salary, postedDate, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {    
        const jobTitle = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_TITLE_SELECTOR);
        const companyName = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_COMPANY_NAME_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
        }

        const companyLocation = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_COMPANY_LOCATION_SELECTOR);
        const timeEngagement = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_TIME_ENGAGEMENT_SELECTOR);
        const salary = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_SALARY_SELECTOR);
        const jobBenefits = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_JOB_BENEFITS_SELECTOR);
        newJob.companyLocation = companyLocation?.trim();
        newJob.timeEngagement = timeEngagement?.trim();
        newJob.salary = salary?.trim();
        newJob.benefits = jobBenefits?.trim();

        const postedAgo = await browserAPI.getText(Constants.SIMPLY_HIRED_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            const postedDate = this.utils.getPostedDate4SimplyHired(postedAgo.trim());
            newJob.postedDate = postedDate;
        }
        
        await this.scrapeRequiredSkills(newJob, browserAPI);

        return newJob;
    }

    private async scrapeRequiredSkills(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const requiredSkillElems = await browserAPI.findElements(Constants.SIMPLY_HIRED_DETAILS_JOB_REQUIRED_SKILLS_SELECTOR);
        let requiredSkills = await Promise.all(requiredSkillElems.map(async elem => (await browserAPI.getTextFromElement(elem))!.trim()));

        newJob.requiredSkills = requiredSkills.join(Constants.COMMA + Constants.WHITESPACE);       
    }
}
