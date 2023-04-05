import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class GraduatelandScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Graduateland in the scrape is (jobTitle, orgName, orgUrlRef, postedAgo, workLocation, timeEngagement, requiredSkills, companyIndustry, description).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_TITLE_SELECTOR);
        const orgNameElement = await browserAPI.findElement(Constants.GRADUATELAND_DETAILS_COMPANY_NAME_SELECTOR);
        const orgUrlRef = await browserAPI.getDataFromAttr(orgNameElement!, Constants.HREF_SELECTOR);
        const orgName = await browserAPI.getTextFromElement(orgNameElement!);
        const jobDescription = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            organization: { name: orgName?.trim(), urlReference: orgUrlRef?.trim() } as OrganizationDTO,
        }

        const postedAgo = await browserAPI.getText(Constants.GRADUATELAND_DETAILS_POSTED_AGO_SELECTOR);
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4Graduateland(postedAgo.trim());
        }

        await this.scrapeJobDetails(browserAPI, newJob);

        return newJob;
    }

     /**
   * @description Function which scrapes jobDetails part of the page, formats it and stores it into the
   * workLocation, timeEngagement, requiredSkills, requiredLanguages, and organization.orgIndustry properties.
   * @param {BrowserAPI} browserAPI
   * @param {JobDTO} newJob
   * @returns {Promise<void>}
   */
    private async scrapeJobDetails(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsValueElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_VALUES_SELECTOR);

        const jobDetailsKeyElements = await browserAPI.findElements(Constants.GRADUATELAND_DETAILS_JOB_DETAILS_KEY_SELECTOR);
        for (let i = 0; i < jobDetailsKeyElements.length; i++) {
            const keyword = await browserAPI.getTextFromElement(jobDetailsKeyElements[i]);
            let value;
            switch(keyword!.trim()) {
                case Constants.LOCATION:
                    const valueElem = await browserAPI.findElementOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                    value = await browserAPI.getTextFromElement(valueElem!);
                    newJob.workLocation = value?.split(Constants.WHITESPACE).map(part => part.trim()).join(Constants.EMPTY_STRING).trim();
                    break;
                case Constants.CATEGORY:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    newJob.organization.industry = value?.trim();
                    break;
                case Constants.TYPE:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    newJob.timeEngagement = value?.trim();
                    break;
                case Constants.SKILLS:
                    const valueElems = await browserAPI.findElementsOnElement(jobDetailsValueElements[i], Constants.SPAN_SELECTOR);
                    let values = await Promise.all(valueElems.map(async elem => (await browserAPI.getTextFromElement(elem))?.trim()));
                    newJob.requiredSkills = values.filter(part => part && part.length > 1).join(Constants.COMMA + Constants.WHITESPACE);
                    break;
                case Constants.MUST_HAVE_LANGUAGE:
                    value = await browserAPI.getTextFromElement(jobDetailsValueElements[i]);
                    newJob.requiredLanguages = value?.split(Constants.WHITESPACE).map(part => part.trim().replace(/[,]$/, Constants.EMPTY_STRING))
                        .filter(part => part.length > 1).join(Constants.COMMA + Constants.WHITESPACE);
                    break;
            }
        }
    } 
}
