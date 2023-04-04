import { Inject, Service } from "typedi";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class NoFluffScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on NoFluff in the scrape is (jobTitle, workLocation, isRemote, postedDate, companyName, companyLink, salary, requiredSkills, companyDescripiton, jobDetails, jobDescription).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {
        const jobTitle = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_JOB_TITLE_SELECTOR));

        await this.clickShowMore(Constants.NO_FLUFF_DETAILS_JOB_DESCRIPTION_SHOW_MORE_SELECTOR, browserAPI);
        const jobDescription = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const companyNameLinkEl = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const companyLink = await browserAPI.getDataFromAttr(companyNameLinkEl!, Constants.HREF_SELECTOR);
        const companyName = await browserAPI.getTextFromElement(companyNameLinkEl!);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: companyLink ? Constants.NO_FLUFF_JOBS_URL + companyLink.trim() : undefined,
        }

        const postedAgo = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_POSTED_AGO_SELECTOR));
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4NoFluff(postedAgo.trim());
        }
        
        const salary = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_SALARY_SELECTOR);
        const companyDescription = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_COMPANY_DESCRIPTION_SELECTOR);        
        newJob.salary = salary?.trim();
        newJob.companyDescription = companyDescription?.trim();

        await this.scrapeCompanyDetails(newJob, browserAPI);
        await this.scrapeJobSkills(newJob, browserAPI);
        await this.scrapeJobDetails(newJob, browserAPI);
        newJob.requirements = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_REQUIREMENTS_CONTENT_SELECTOR, browserAPI);
        newJob.benefits =  await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_BENEFITS_SELECTOR, browserAPI);
        newJob.equipmentProvided = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_EQUIPMENT_SUPPLIED_SELECTOR, browserAPI);
        newJob.workLocation = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_LOCATIONS_SELECTOR, browserAPI);
        const showMoreResponsibilitiesButton = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_SHOW_MORE_RESPONSIBILITIES_SELECTOR);
        if (showMoreResponsibilitiesButton) {
            await showMoreResponsibilitiesButton.click();
        }
        newJob.responsibilities = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_RESPONSIBILITIES_SELECTOR, browserAPI);

        // there are two places on the page where information about 'remoteness' of the job is displayed. I am checking both places.
        // first in the element with the selector NO_FLUFF_DETAILS_REMOTE_SELECTOR, second in job details
        const remoteElement = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_REMOTE_SELECTOR);
        if (remoteElement) {
            newJob.isRemote = true;
        }

        return newJob;
    }

    /**
   * @description Function attempts to click the button on the page if found by selecor.
   * @param {string} selector
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<void>}
   */
    private async clickShowMore(selector: string, browserAPI: BrowserAPI): Promise<void> {
        const showMoreButton = await browserAPI.findElement(selector);
        if (showMoreButton) {
            await showMoreButton.click();
        }
    }

    /**
    * @description Function which scrapes JobDetails part of the page, formats it and stores it into the 
    * details property of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobDetailValuesElements = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_JOB_DETAILS_SELECTOR);
        let jobDetails = Constants.EMPTY_STRING;
        for (let i = 0; i < jobDetailValuesElements.length; i++) {
            let value = await browserAPI.getTextFromElement(jobDetailValuesElements[i]);
            value = value?.trim() || Constants.EMPTY_STRING;
            switch (value) {
                case Constants.FULLY_REMOTE:
                    newJob.isRemote = true;
                    break;
                case Constants.PERMANENT_CONTRACT:
                    newJob.timeEngagement = value;
                    break;
                default:
                    jobDetails += value + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
            }
        }

        newJob.details = jobDetails;
    }

    /**
    * @description Function which scrapes companyDetails part of the page, formats it and stores it into the 
    * companyFounded, companySize, and companyLocation properties of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeCompanyDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const companyDetailsElements = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_COMPANY_DETAILS_SELECTOR);
        for (let i = 0; i < companyDetailsElements.length; i++) {
            const companyDetailsKeyElement = await browserAPI.findElementOnElement(companyDetailsElements[i], Constants.SPAN_SELECTOR);
            if (!companyDetailsKeyElement) continue;
            let companyDetailsKey = await browserAPI.getTextFromElement(companyDetailsKeyElement);
            companyDetailsKey = companyDetailsKey!.trim();
            const companyDetailsKeyAndValueStr = await browserAPI.getTextFromElement(companyDetailsElements[i]);
            
            switch(companyDetailsKey) {
                case Constants.FOUNDED_IN:
                    newJob.companyFounded = companyDetailsKeyAndValueStr?.trim().replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
                case Constants.COMPANY_SIZE_NOFLUFF:
                    newJob.companySize = companyDetailsKeyAndValueStr?.trim().replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
                case Constants.MAIN_LOCATION:
                    newJob.companyLocation = companyDetailsKeyAndValueStr?.trim().replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
            }
        }
    }

    /**
    * @description Function which scrapes Skills part of the page - required and 'nice to have'. Formats the gathered skills 
    * and stores them into the requiredSkills and goodToHaveSkills of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeJobSkills(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const reqSkillsTitleEls = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_SKILL_TITLES_SELECTOR);
        const reqSkillsSectionEls = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_SKILLS_SECTION_SELECTOR);

        for (let i = 0; i < reqSkillsTitleEls.length; i++) {
            const skillSectionTitle = await browserAPI.getTextFromElement(reqSkillsTitleEls[i]);
            const skillsElementsInSection = await browserAPI.findElementsOnElement(reqSkillsSectionEls[i], Constants.LI_SELECTOR);
            let listOfSkills = await Promise.all(skillsElementsInSection.map(async el => (await browserAPI.getTextFromElement(el))?.trim()));

            if (skillSectionTitle?.trim() === 'Nice to have') {
                newJob.goodToHaveSkills = listOfSkills.join(Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER);
            } else {
                newJob.requiredSkills = listOfSkills.join(Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER);
            }
        }
    }

    /**
   * @description Function scrapes and formats part of the webiste determined by the passed selector.
   * Function then returns the resulting value.
   * @param {string} selector
   * @param {JobDTO} newJob
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<string>}
   */
    private async scrapeNoFluffListOfElements(selector: string, browserAPI: BrowserAPI): Promise<string> {
        const selectedElemList = await browserAPI.findElements(selector);

        let selectedJobProperty = Constants.EMPTY_STRING;
        for (let i = 0; i < selectedElemList.length; i++) {
            const benefit = await browserAPI.getTextFromElement(selectedElemList[i]);
            selectedJobProperty += benefit?.trim() + Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER;
        }

        return selectedJobProperty.trim();
    }
}
