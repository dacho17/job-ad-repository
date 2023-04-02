import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class CareerJetScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on CareerJet in the scrape is (jobTitle, companyName, companyLocation, timeEngagement, salary, postedDate, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.CAREER_JET_DETAILS_JOB_TITLE_SELECTOR);
        const companyName = await browserAPI.getText(Constants.CAREER_JET_DETAILS_COMPANY_NAME_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.CAREER_JET_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            companyName: companyName!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId
        }

        const postedAgo = await browserAPI.getText(Constants.CAREER_JET_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            const postedDate = this.utils.getPostedDate4CareerJet(postedAgo);
            newJob.postedDate = this.utils.getPostedDate4CareerJet(postedAgo);
        }

        await this.scrapeSubtitleSection(newJob, browserAPI);

        return newJob;
    }

   /**
   * @description Function which scrapes a part of the page and sets companyLocation and timeManagement properties of new JobDTO,
   * If salary is found it sets that property as well.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeSubtitleSection(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobSubtitleElements = await browserAPI.findElements(Constants.CAREER_JET_DETAILS_JOB_SUBTITLE_SELECTOR);
        const jobSubtitleData = await Promise.all(jobSubtitleElements.map(async elem => await browserAPI.getTextFromElement(elem)));

        newJob.companyLocation = jobSubtitleData[0]!;
        if (jobSubtitleData.length === 3) {
            newJob.timeEngagement = jobSubtitleData[1] + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER +  jobSubtitleData[2];
        } else if (jobSubtitleData.length === 4) {
            newJob.salary = jobSubtitleData[1]!;
            newJob.timeEngagement = jobSubtitleData[2] + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER +  jobSubtitleData[3];
        } else {
            throw `During CareerJetDetails Scraping - unexpected number of elements appeared ${jobSubtitleData.length}`;
        }
    } 
}
