import { Service } from "typedi";
import JobDTO from "../../../helpers/dtos/jobDTO";
import BrowserAPI from "../../browserAPI";
import Constants from "../../../helpers/constants";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";

@Service()
export default class AdzunaScraper implements IJobBrowserScraper {

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Adzuna in the scrape is (jobTitle, orgName, orgLocation, timeEngagement, description, companyLink).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        await browserAPI.clickButton(Constants.ADZUNA_DETAILS_EXTEND_AD_BUTTON_SELECTOR);
    
        let jobTitle = await browserAPI.getText(Constants.ADZUNA_DETAILS_JOB_TITLE_SELECTOR);
        let subTitleSectionElement = await browserAPI.findMultiple(Constants.ADZUNA_DETAILS_SUBTITLE_SECTION_SELECTOR)
        let orgLocation = await browserAPI.getTextFromElement(subTitleSectionElement[0]);
        let orgName = await browserAPI.getTextFromElement(subTitleSectionElement[1]);
        let timeEngagement = await browserAPI.getTextFromElement(subTitleSectionElement[2]);
        let jobDescription = await browserAPI.getText(Constants.ADZUNA_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            organization: { name: orgName?.trim() } as OrganizationDTO,
            timeEngagement: timeEngagement?.trim().replace(Constants.WHITESPACE, Constants.MINUS_SIGN),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined
        }

        newJob.organization.location = orgLocation?.trim();

        let orgLinkElement = await browserAPI.findElement(Constants.ADZUNA_DETAILS_COMPANY_LINK_SELECTOR);
        if (orgLinkElement) {
            let orgLink = await browserAPI.getDataFromAttr(orgLinkElement, Constants.HREF_SELECTOR);
            newJob.organization.urlReference = orgLink?.trim()
        }

        return newJob;
    }
}
