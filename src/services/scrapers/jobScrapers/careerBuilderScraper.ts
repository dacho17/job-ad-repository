import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";


@Service()
export default class CareerBuilderScraper implements IJobBrowserScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on CareerBuilder in the scrape is (jobTitle, companyName, companyLocation, timeEngagement, jobDescription, requiredSkills).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.CAREER_BUILDER_DETAILS_JOB_TITLE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.CAREER_BUILDER_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: 'Unrevealed'
        }

        await this.scrapeSubtitleSection(newJob, browserAPI);
        await this.scrapeRequiredSkills(newJob, browserAPI);

        return newJob;
    }

    /**
   * @description Function which scrapes a part of the page and sets companyLocation and timeManagement properties of new JobDTO,
   * If companyName is found it sets that property as well.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeSubtitleSection(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobSubtitleElement = await browserAPI.findElements(Constants.CAREER_BUILDER_DETAILS_JOB_SUBTITLE_SELECTOR);
        let firstSubtitleProperty = await browserAPI.getTextFromElement(jobSubtitleElement[0]); 
        let secondSubtitleProperty = await browserAPI.getTextFromElement(jobSubtitleElement[1]);
        if (jobSubtitleElement.length === 3) {
            const thirdSubtitleProperty = await browserAPI.getTextFromElement(jobSubtitleElement[2]);
            newJob.companyName = firstSubtitleProperty?.trim() || Constants.UNDISLOSED_COMPANY;
            newJob.companyLocation = secondSubtitleProperty?.trim()
            newJob.timeEngagement = thirdSubtitleProperty?.trim();
        } else {
            newJob.companyLocation = firstSubtitleProperty?.trim();
            newJob.timeEngagement = secondSubtitleProperty?.trim();
        }
    }

    /**
   * @description Function which scrapes a part of the page and sets requiredSkills property of the new JobDTO object.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async scrapeRequiredSkills(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const listOfRequiredSkillElements = await browserAPI.findElements(Constants.CAREER_BUILDER_DETAILS_REQUIRED_SKILLS_SELECTOR);
        const requiredSkills = await Promise.all(listOfRequiredSkillElements.map(async elem => await browserAPI.getTextFromElement(elem)));

        newJob.requiredSkills = requiredSkills.join(Constants.COMMA_SIGN + Constants.WHITESPACE);
    }
}
