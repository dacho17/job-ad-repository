import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class ArbeitNowScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on ArbeitNow in the scrape is (jobTitle, officeLocation, orgName, salary, jobDetails, postedAgo, jobDescription).
   * Properties timeEngagement, requiredExperience, isRemote, isStudentPosition are expected to be attached to the job object 
   * in the parsing stage.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_TITLE_SELECTOR)
        let orgName = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_COMPANY_NAME_SELECTOR);
        const orgLocation = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_COMPANY_LOCATION_SELECTOR);
        const salary = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_SALARY_INFORMATION);
        
        const jobDescription = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            organization: {
                name: orgName?.trim() || Constants.UNDISLOSED_COMPANY,
                location: orgLocation?.trim()
            } as OrganizationDTO,
            description: jobDescription!.trim(),
            salary: salary?.replace(Constants.SALARY_ICON, Constants.EMPTY_STRING).trim(),
            jobAdId: jobAdId ?? undefined,
        }

        const postedDateStr = await browserAPI.getDataSelectorAndAttr(Constants.ARBEITNOW_DETAILS_POSTED_DATE_SELECTOR, Constants.DATETIME_SELECTOR)
        if (postedDateStr) {
            newJob.postedDateTimestamp = this.utils.transformToTimestamp(postedDateStr!.trim()) ?? undefined
            newJob.postedDate = new Date(newJob.postedDateTimestamp!);
        }

        const jobDetails = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_DETAILS_SELECTOR);
        newJob.details = jobDetails?.trim();

        return newJob;
    }
}
