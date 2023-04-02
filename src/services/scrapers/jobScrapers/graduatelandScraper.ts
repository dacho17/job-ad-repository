import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobScraper from "../interfaces/IJobScraper";

@Service()
export default class GraduatelandScraper implements IJobScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Graduateland in the scrape is (jobTitle, companyName, companyLink, postedAgo, details, description).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_TITLE_SELECTOR);
        const companyNameElement = await browserAPI.findElement(Constants.GRADUATELAND_DETAILS_COMPANY_NAME_SELECTOR);
        const companyLink = await browserAPI.getDataFromAttr(companyNameElement!, Constants.HREF_SELECTOR);
        const companyName = await browserAPI.getTextFromElement(companyNameElement!);
        const jobDescription = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: Constants.GRADUATELAND_URL + companyLink?.trim()
        }

        const postedAgo = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4Graduateland(postedAgo.trim());
        }

        await this.scrapeJobDetails(browserAPI, newJob);

        return newJob;
    }

     /**
   * @description Function which scrapes jobDetails part of the page, formats it and stores it into the job.details property.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValues: string[] = [];
        const jobDetailsValueElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_VALUES_SELECTOR);
        for (let i = 0; i < jobDetailsValueElements.length; i++) {
            const value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            jobDetailsValues.push(value!.trim());
        }

        newJob.requiredSkills = Constants.EMPTY_STRING;
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            switch(keyword!.trim()) {
                case Constants.LOCATION:
                    newJob.workLocation = jobDetailsValues[i];
                    break;
                case Constants.CATEGORY:
                    newJob.companyIndustry = jobDetailsValues[i];
                    break;
                case Constants.TYPE:
                    newJob.timeEngagement = jobDetailsValues[i];
                    break;
                case Constants.SKILLS:
                    newJob.requiredSkills += jobDetailsValues[i] + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
                    break;
                case Constants.MUST_HAVE_LANGUAGE:
                    newJob.requiredSkills += jobDetailsValues[i] + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
                    break;
            }
        }
    } 
}
