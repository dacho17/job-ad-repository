import { Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class EuroJobSitesScraper implements IJobBrowserScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on EuroJobSites in the scrape is (jobTitle, orgName, orgLocation, additionalJobLink, jobDescription, jobDetails).
   * @param {number | null} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const [jobTitle, orgName, orgLocation] = await this.scrapeHeader(browserAPI);
        const jobDescription = await browserAPI.getText(Constants.EURO_JOB_SITES_DETAILS_AD_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle,
            url: browserAPI.getUrl(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            organization: { name: orgName?.trim(), location: orgLocation?.trim() } as OrganizationDTO,
        }

        const additionalJobLink = await browserAPI.getDataSelectorAndAttr(Constants.EURO_JOB_SITES_DETAILS_ADDITIONAL_JOB_LINK_SELECTOR, Constants.HREF_SELECTOR);
        if (additionalJobLink) {
            const curUrl = browserAPI.getUrl();
            newJob.additionalJobLink = curUrl.substring(0, curUrl.indexOf(Constants.DOT_COM) + 4) + additionalJobLink.trim();
        }
        
        const jobDetailsKeysElement = await browserAPI.findElements(Constants.EURO_JOB_SITES_DETAILS_JOB_DETAILS_KEYS_SELECTOR);
        const jobDetailsKeys = await Promise.all(jobDetailsKeysElement.map(async element => await browserAPI.getTextFromElement(element)));
        let jobDetailsText = await browserAPI.getText(Constants.EURO_JOB_SITES_DETAILS_JOB_DETAILS_SELECTOR);
        if (jobDetailsText) {
            let isFirstElem = true;
            for (let i = 0; i < jobDetailsKeys.length; i++) {
                if (isFirstElem) {
                    isFirstElem = false;
                    continue;
                }
                const delimiterIndex: number = jobDetailsText.indexOf(jobDetailsKeys[i]!);
                jobDetailsText = jobDetailsText.slice(0, delimiterIndex) + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER + jobDetailsText.slice(delimiterIndex);
            }
            jobDetailsText = jobDetailsText.replace(/: /g, Constants.EQUALS).trim();

            if (jobDetailsText !== Constants.APPLY_NOW) {   // sometimes 'Apply Now' is the value of jobDetails and this should not be stored
                newJob.details = jobDetailsText.trim();
            } 
        }

        return newJob;
    }

    /**
   * @description Function which looks to scrape jobTitle, orgName, and orgLocation,
   * The function returns the triplet.
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<[string, string | null, string | undefined]>}
   */
    private async scrapeHeader(browserAPI: BrowserAPI): Promise<[string, string | null, string | undefined]>  {
        const jobHeaderElements = await browserAPI.findElements(Constants.EURO_JOB_SITES_DETAILS_HEADER_SELECTOR);
        let offset = 0;
        if (jobHeaderElements.length == 4) offset = 1;
        const jobTitle = await browserAPI.getTextFromElement(jobHeaderElements[offset]);
        const orgName = await browserAPI.getTextFromElement(jobHeaderElements[offset + 1]);
        const orgLocation = await browserAPI.getTextFromElement(jobHeaderElements[offset + 2]);
    
        return [jobTitle!.trim(), orgName?.trim() || null, orgLocation?.trim()];
    }
}
