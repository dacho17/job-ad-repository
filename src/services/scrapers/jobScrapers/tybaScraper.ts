import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class TybaScraper implements IJobBrowserScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Tyba in the scrape is (jobTitle, companyNam, companyLink, jobDescription (workLocation, companyIndustry, timeEngagement, requiredSkills).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.TYBA_DETAILS_JOB_TITLE_SELECTOR);
        const companyNameElem = await browserAPI.findElement(Constants.TYBA_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const companyLink = await browserAPI.getDataFromAttr(companyNameElem!, Constants.HREF_SELECTOR)
        const companyName = await browserAPI.getTextFromElement(companyNameElem!);
        const jobDescription = await browserAPI.getText(Constants.TYBA_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            jobAdId: jobAdId ?? undefined,
            description: jobDescription!.trim(),
            companyLink: companyLink ? Constants.TYBA_URL + companyLink.trim() : undefined
        }

        await this.scrapeJobDetails(browserAPI, newJob);

        return newJob
    }

    /**
    * @description Function which scrapes jobDetails part of the page, formats it and stores it into the 
    * workLocation, timeEngagement, requiredSkills, companyIndustry properties.
    * @param {BrowserAPI} browserAPI
    * @param {JobDTO} newJob
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValues: string[] = [];
        const jobDetailsValueElements = await browserAPI.findElements(Constants.TYBA_DETAILS_JOB_DETAILS_VALUES_SELECTOR);
        for (let i = 0; i < jobDetailsValueElements.length; i++) {
            const value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
            jobDetailsValues.push(value!.trim());
        }

        newJob.requiredSkills = Constants.EMPTY_STRING;
        const jobDetailsKeyElements = await browserAPI.findElements(Constants.TYBA_DETAILS_JOB_DETAILS_KEYS_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            switch (keyword!.trim()) {
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
