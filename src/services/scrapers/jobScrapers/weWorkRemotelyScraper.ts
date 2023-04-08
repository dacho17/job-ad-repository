import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class WeWorkRemotelyScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAd and browserAPI.
   * Data available on WeWorkRemotely in the scrape is (jobTitle, organization.name, organization.location, organization.webiste, organization.urlReference, postedAgo, nOfApplicants, isRemote, timeEngagement, workLocation, salary, jobDetails, jobDescription).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        const jobTitle = await browserAPI.getText(Constants.WE_WORK_REMOTELY_DETAIL_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            jobAd!.isAdPresentOnline = false;
            return null;
        }
        const jobDescription = await browserAPI.getText(Constants.WE_WORK_REMOTELY_JOB_DESCRIPTION_SELECTOR);
        const companyNameAndLinkElement = await browserAPI.findElement(Constants.WE_WORK_REMOTELY_COMPANY_NAME_AND_LINK_SELECTOR);

        const orgLink = await browserAPI.getDataFromAttr(companyNameAndLinkElement!, Constants.HREF_SELECTOR);
        const orgName = await browserAPI.getTextFromElement(companyNameAndLinkElement!);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription!.trim(),
            jobAdId: jobAd?.id ?? undefined,
            organization: {
                name: orgName?.trim(),
                urlReference: orgLink ? Constants.WE_WORK_REMOTELY_URL + orgLink.trim() : undefined
            } as OrganizationDTO,
        }

        const orgWebsite = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_COMPANY_WEBSITE_SELECTOR, Constants.HREF_SELECTOR);
        const orgLocationCandidate = await browserAPI.getText(Constants.WE_WORK_REMOTELY_COMPANY_LOCATION_SELECTOR)

        if (orgLocationCandidate?.trim() === newJob.organization.name) {
            
        } else if (orgLocationCandidate?.toLowerCase().includes(Constants.REMOTE)) {   // this value is sometimes 'Remote' or a variation of it
            newJob.isRemote = true;
        } else {
            newJob.organization.location = orgLocationCandidate?.trim();
        }

        const postedDate = await browserAPI.getDataSelectorAndAttr(Constants.WE_WORK_REMOTELY_POSTED_DATE_SELECTOR, Constants.DATETIME_SELECTOR);

        newJob.organization.website = orgWebsite?.trim();
        newJob.postedDate = postedDate ? new Date(postedDate.trim()) : undefined;
        
        await this.scrapeJobDetails(newJob, browserAPI);

        const numberOfApplicants = await browserAPI.getText(Constants.WE_WORK_REMOTELY_NUMBER_OF_APPLICANTS_SELECTOR);
        if (numberOfApplicants) {
            newJob.nOfApplicants = this.utils.getNumberOfApplicantsWWR(numberOfApplicants.trim());
        }

        return newJob;
    }

    /**
    * @description Function which scrapes JobDetails part of the page, formats it and stores it into 
    * isRemote, timeEngagement, workLocation, salary and details properties of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        let jobDetailElements = await browserAPI.findElements(Constants.WE_WORK_REMOTELY_JOB_DETAILS_SELECTOR);
        jobDetailElements.shift(); jobDetailElements.shift();  // first two elements of the list are irrelevant
        let jobDetails = [];
        let timeEngagements = [];
        for (let i = 0; i < jobDetailElements.length; i++) {
            let jobDetail = await browserAPI.getTextFromElement(jobDetailElements[i]);
            jobDetail = jobDetail!.trim();
            switch(jobDetail.toLowerCase()) {
                case Constants.ANYWHERE_IN_THE_WORLD:
                    newJob.isRemote = true;
                    break;
                case Constants.FULL_TIME:
                    timeEngagements.push(Constants.FULL_TIME);
                    break;
                default:
                    if (jobDetail.indexOf(Constants.USD) !== -1) {
                        newJob.salary = jobDetail;
                    } else if (jobDetail.indexOf(Constants.ONLY) !== -1) {
                        newJob.workLocation = jobDetail.substring(0, jobDetail.indexOf(Constants.ONLY) - 1);
                    } else if (jobDetail.indexOf(Constants.CONTRACT) !== -1) {
                        timeEngagements.push(Constants.CONTRACT);
                    } else jobDetails.push(jobDetail);
            }
        }

        newJob.timeEngagement = timeEngagements.join(Constants.COMMA + Constants.WHITESPACE);
        newJob.details = jobDetails.join(Constants.COMMA + Constants.WHITESPACE);
    }
}
