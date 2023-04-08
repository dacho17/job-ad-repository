import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class CareerJetScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
      * @description Function that accepts jobAd and browserAPI.
   * Data available on CareerJet in the scrape is (jobTitle, orgName, orgLocation, timeEngagement, isTrainingProvided, salary, postedDate, jobDescription).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        const jobTitle = await browserAPI.getText(Constants.CAREER_JET_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            jobAd!.isAdPresentOnline = false;
            return null;
        }
        const orgName = await browserAPI.getText(Constants.CAREER_JET_DETAILS_COMPANY_NAME_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.CAREER_JET_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            url: browserAPI.getUrl(),
            organization: { name: orgName?.trim() || Constants.UNDISLOSED_COMPANY } as OrganizationDTO,
            description: jobDescription!.trim(),
            jobAdId: jobAd?.id ?? undefined,
        }

        const postedAgo = await browserAPI.getText(Constants.CAREER_JET_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4CareerJet(postedAgo);
        }

        await this.scrapeSubtitleSection(newJob, browserAPI);

        return newJob;
    }

   /**
   * @description Function which scrapes a part of the page and sets orgLocation, timeEngagement and isTrainingProvided properties of new JobDTO,
   * If salary is found it sets that property as well.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeSubtitleSection(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobSubtitleElements = await browserAPI.findElements(Constants.CAREER_JET_DETAILS_JOB_SUBTITLE_SELECTOR);
        const jobSubtitleData = await Promise.all(jobSubtitleElements.map(async elem => await browserAPI.getTextFromElement(elem)));
        newJob.organization.location = jobSubtitleData[0]!.trim();
        
        if (jobSubtitleData.length < 2) throw `Unexpected number of elements in subtitle section has been found while scraping ${newJob.url}`;
        let offset = 1;
        if (jobSubtitleData.length === 4) {
            newJob.salary = jobSubtitleData[offset]!.trim();
            offset += 1;
        }

        let timeEngagementItems = [];
        for (; offset < jobSubtitleData.length; offset ++) {
            let timeEngagementItem = jobSubtitleData[offset]!.trim();
            if (timeEngagementItem.toLowerCase() === Constants.TRAINING) {
                newJob.isTrainingProvided = true;
            } else timeEngagementItems.push(timeEngagementItem.toLowerCase());
        }

        newJob.timeEngagement = timeEngagementItems.join(Constants.COMMA + Constants.WHITESPACE);
    } 
}
