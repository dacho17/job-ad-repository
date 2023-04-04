import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class WeWorkRemotelyScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on WeWorkRemotely in the scrape is (jobTitle, companyName, companyLocation, companyWebiste, companyLink, postedAgo, nOfApplicants, jobDetails, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.WE_WORK_REMOTELY_DETAIL_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.WE_WORK_REMOTELY_JOB_DESCRIPTION_SELECTOR);
        const companyNameAndLinkElement = await browserAPI.findElement(Constants.WE_WORK_REMOTELY_COMPANY_NAME_AND_LINK_SELECTOR);

        const companyLink = await browserAPI.getDataFromAttr(companyNameAndLinkElement!, Constants.HREF_SELECTOR);
        const companyName = await browserAPI.getTextFromElement(companyNameAndLinkElement!);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: companyLink ? Constants.WE_WORK_REMOTELY_URL + companyLink.trim() : undefined
        }

        const companyWebsite = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_COMPANY_WEBSITE_SELECTOR, Constants.HREF_SELECTOR);
        const companyLocation = await browserAPI.getText(Constants.WE_WORK_REMOTELY_COMPANY_LOCATION_SELECTOR)
        const postedDate = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_POSTED_DATE_SELECTOR, Constants.DATETIME_SELECTOR);
        const jobDetails = await browserAPI.getText(Constants.WE_WORK_REMOTELY_JOB_DETAILS_SELECTOR);

        newJob.companyWebsite = companyWebsite?.trim();
        newJob.companyLocation = companyLocation?.trim();
        newJob.postedDate = postedDate ? new Date(postedDate.trim()) : undefined;
        newJob.details = jobDetails?.trim();


        const numberOfApplicants = await browserAPI.getText(Constants.WE_WORK_REMOTELY_NUMBER_OF_APPLICANTS_SELECTOR);
        if (numberOfApplicants) {
            newJob.nOfApplicants = this.utils.getNumberOfApplicantsWWR(numberOfApplicants.trim());
        }

        return newJob;
    }
}
