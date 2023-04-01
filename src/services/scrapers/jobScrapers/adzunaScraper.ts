import { Service } from "typedi";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import Constants from "../../../helpers/constants";
import IJobScraper from "../interfaces/IJobScraper";

@Service()
export default class AdzunaScraper implements IJobScraper {

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Adzuna in the scrape is (jobTitle, companyName, companyLocation, timeEngagement, description, companyLink).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        await browserAPI.clickButton(Constants.ADZUNA_DETAILS_EXTEND_AD_BUTTON_SELECTOR);
    
        let jobTitle = await browserAPI.getText(Constants.ADZUNA_DETAILS_JOB_TITLE_SELECTOR);
        let subTitleSectionElement = await browserAPI.findMultiple(Constants.ADZUNA_DETAILS_SUBTITLE_SECTION_SELECTOR)
        let companyLocation = await browserAPI.getTextFromElement(subTitleSectionElement[0]);
        let companyName = await browserAPI.getTextFromElement(subTitleSectionElement[1]);
        let timeEngagement = await browserAPI.getTextFromElement(subTitleSectionElement[2]);
        let jobDescription = await browserAPI.getText(Constants.ADZUNA_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            companyLocation: companyLocation?.trim(),
            companyName: companyName!.trim(),
            timeEngagement: timeEngagement?.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId
        }

        let companyLinkElement = await browserAPI.findElement(Constants.ADZUNA_DETAILS_COMPANY_LINK_SELECTOR);
        if (companyLinkElement) {
            let companyLink = await browserAPI.getDataFromAttr(companyLinkElement, Constants.HREF_SELECTOR);
            newJob.companyLink = companyLink?.trim()
        }

        return newJob;
    }
}
