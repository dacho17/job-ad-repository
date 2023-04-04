import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class ArbeitNowScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on ArbeitNow in the scrape is (jobTitle, officeLocation, companyName, salary, jobDetails, postedAgo, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        // 

        const jobTitle = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_TITLE_SELECTOR)
        const companyName = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_COMPANY_NAME_SELECTOR);
        const companyLocation = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_COMPANY_LOCATION_SELECTOR);
        const salary = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_SALARY_INFORMATION);
        
        const jobDetails = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_DETAILS_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.ARBEITNOW_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            companyName: companyName!.trim(),
            companyLocation: companyLocation?.trim(),
            salary: salary?.trim(),
            details: jobDetails?.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
        }

        const postedDateStr = await browserAPI.getDataSelectorAndAttr(Constants.ARBEITNOW_DETAILS_POSTED_DATE_SELECTOR, Constants.DATETIME_SELECTOR)
        if (postedDateStr) {
            newJob.postedDate = new Date(this.utils.transformToTimestamp(postedDateStr!.trim()))
        }

        return newJob;
    }
}
