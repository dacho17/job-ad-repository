import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class NoFluffScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAd and browserAPI.
   * Data available on NoFluff in the scrape is (jobTitle, workLocation, equipmentProvided, benefits, requirements, isRemote, timeEngagement, postedDate, organization.name, organization.urlReference, organization.founded, organization.size, and organization.location, salary, requiredSkills, goodToHaveSkills, jobDetails, jobDescription).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO | null>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {
        await browserAPI.waitForSelector('DUMMY', 5000);
        const jobTitle = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_JOB_TITLE_SELECTOR));
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }

        await browserAPI.clickButton(Constants.NO_FLUFF_DETAILS_JOB_DESCRIPTION_SHOW_MORE_SELECTOR);
        const jobDescription = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_JOB_DESCRIPTION_SELECTOR);

        const orgNameLinkEl = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const orgUrlRef = await browserAPI.getDataFromAttr(orgNameLinkEl!, Constants.HREF_SELECTOR);
        const orgName = await browserAPI.getTextFromElement(orgNameLinkEl!);

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription?.trim() || Constants.EMPTY_STRING,
            jobAdId: jobAd?.id ?? undefined,
            organization: { name: orgName?.trim(), urlReference: orgUrlRef ? Constants.NO_FLUFF_JOBS_URL + orgUrlRef.trim() : undefined } as OrganizationDTO,
        }

        const postedAgo = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_POSTED_AGO_SELECTOR));
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4NoFluff(postedAgo.trim());
        }

        const orgDescription = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_COMPANY_DESCRIPTION_SELECTOR);        
        newJob.organization.description = orgDescription?.trim();
        
        const salary = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_SALARY_SELECTOR);
        if (salary) {
            newJob.salary = this.formatSalary(salary);
        }

        await this.scrapeCompanyDetails(newJob, browserAPI);
        await this.scrapeJobSkills(newJob, browserAPI);
        await this.scrapeJobDetails(newJob, browserAPI);
        newJob.requirements = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_REQUIREMENTS_CONTENT_SELECTOR, browserAPI, newJob);
        newJob.benefits =  await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_BENEFITS_SELECTOR, browserAPI, newJob);
        newJob.equipmentProvided = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_EQUIPMENT_SUPPLIED_SELECTOR, browserAPI, newJob);
        newJob.workLocation = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_LOCATIONS_SELECTOR, browserAPI, newJob);

        await browserAPI.clickButton(Constants.NO_FLUFF_DETAILS_SHOW_MORE_RESPONSIBILITIES_SELECTOR);
        newJob.responsibilities = await this.scrapeNoFluffListOfElements(Constants.NO_FLUFF_DETAILS_JOB_RESPONSIBILITIES_SELECTOR, browserAPI, newJob);

        // there are two places on the page where information about 'remoteness' of the job is displayed. I am checking both places.
        // first in the element with the selector NO_FLUFF_DETAILS_REMOTE_SELECTOR, second in job details
        const remoteElement = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_REMOTE_SELECTOR);
        if (remoteElement) {
            newJob.isRemote = true;
        }

        return newJob;
    }

    /**
    * @description Function which scrapes JobDetails part of the page, formats it to timeEngagement and isRemote
    * values and stores them to the respective properties of the newJob.
    * @param {JobDTO} newJob
    * @param {BrowserAPI} browserAPI
    * @returns {Promise<void>}
    */
    private async scrapeJobDetails(newJob: JobDTO, browserAPI: BrowserAPI): Promise<void> {
        const jobDetailValuesElements = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_JOB_DETAILS_SELECTOR);
        let jobDetails = [];
        for (let i = 0; i < jobDetailValuesElements.length; i++) {
            let value = await browserAPI.getTextFromElement(jobDetailValuesElements[i]);
            if (!value) continue;
            value = value.trim().toLowerCase() || Constants.EMPTY_STRING;
            switch (true) {
                case value === Constants.FULLY_REMOTE:
                    newJob.isRemote = true;
                    break;
                case value === Constants.PERMANENT_CONTRACT:
                    newJob.timeEngagement = Constants.PERMANENT;
                    break;
                case value.includes(Constants.ASAP):
                    newJob.startDate = Constants.ASAP;
                    break;
                case value.includes(Constants.RECRUITMENT_LANGUAGE):
                    newJob.requiredLanguages = value.replace(`${Constants.RECRUITMENT_LANGUAGE}${Constants.COLON}${Constants.WHITESPACE}`, Constants.EMPTY_STRING)
                        .split(Constants.AND_SIGN).join(Constants.COMPOSITION_DELIMITER);
                    break;
                default:
                    jobDetails.push(value);
            }
        }

        newJob.details = jobDetails.join(Constants.COMPOSITION_DELIMITER);
    }

    /**
    * @description Function which scrapes companyDetails part of the page, formats it and stores it into the 
    * organization.founded, organization.size, and organization.location properties of the newJob.
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
            if (!companyDetailsKey) continue;
            companyDetailsKey = companyDetailsKey.trim();
            const companyDetailsKeyAndValueStr = await browserAPI.getTextFromElement(companyDetailsElements[i]);
            
            switch(companyDetailsKey) {
                case Constants.FOUNDED_IN_COL:
                    newJob.organization.founded = companyDetailsKeyAndValueStr?.replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
                    break;
                case Constants.COMPANY_SIZE_COL:
                    newJob.organization.size = companyDetailsKeyAndValueStr?.replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
                    break;
                case Constants.MAIN_LOCATION_COL:
                    newJob.organization.location = companyDetailsKeyAndValueStr?.replace(companyDetailsKey, Constants.EMPTY_STRING).trim();
                    break;
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
            let langReq = [];
            for (let i = 0; i < listOfSkills.length; i++) {
                let lowerCasedSkill = listOfSkills[i]?.toLowerCase();
                if (lowerCasedSkill?.indexOf(Constants.B1) !== - 1 || lowerCasedSkill?.indexOf(Constants.B2) !== - 1
                    || lowerCasedSkill?.indexOf(Constants.C1) !== - 1 || lowerCasedSkill?.indexOf(Constants.C2) !== - 1) {
                       langReq.push(listOfSkills[i]); 
                    }
            }

            newJob.requiredLanguages = newJob.requiredLanguages
                ? Constants.COMPOSITION_DELIMITER + langReq.join(Constants.COMPOSITION_DELIMITER)
                : langReq.join(Constants.COMPOSITION_DELIMITER);

            if (skillSectionTitle?.trim() === 'Nice to have') {
                newJob.goodToHaveSkills = listOfSkills.join(Constants.COMPOSITION_DELIMITER);
            } else {
                newJob.requiredSkills = listOfSkills.join(Constants.COMPOSITION_DELIMITER);
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
    private async scrapeNoFluffListOfElements(selector: string, browserAPI: BrowserAPI, job: JobDTO): Promise<string> {
        const selectedElemList = await browserAPI.findElements(selector);

        let eduReq = new Set<string>();
        let expReq = new Set<string>();
        let selectedJobProperty = [];
        for (let i = 0; i < selectedElemList.length; i++) {
            let value = await browserAPI.getTextFromElement(selectedElemList[i]);
            if (!value) continue;
            if (value.endsWith(Constants.COMMA) || value.endsWith(Constants.DOT)) {
                value = value.slice(0, - 1).trim();
            }

            let lowerCasedVal = value.toLowerCase();
            switch(true) {
                case (lowerCasedVal.indexOf(Constants.BACHELOR) !== -1):
                    console.log(`matched bachelor ${lowerCasedVal}`);
                    eduReq.add(Constants.BACHELOR);
                case (lowerCasedVal.indexOf(Constants.MASTER) !== - 1):
                case (value?.indexOf(Constants.MS) !== -1):
                    console.log(`matched master or ms ${lowerCasedVal}`);
                    eduReq.add(Constants.MASTER);
                case (lowerCasedVal.indexOf(Constants.PHD) !== - 1):
                    console.log(`matched phd ${lowerCasedVal}`);
                    eduReq.add(Constants.PHD);
                    break;
                case (lowerCasedVal.indexOf(Constants.YEAR) !== -1):
                    console.log(`matched years ${lowerCasedVal}`);
                    expReq.add(value!);
                    break;
            }

            selectedJobProperty.push(value);
        }

        if (expReq.size > 0) {
            job.requiredExperience = job.requiredExperience
            ? job.requiredExperience + Constants.COMPOSITION_DELIMITER + Array.from([...expReq]).filter((el: string) => el.length > 1).join(Constants.COMPOSITION_DELIMITER)
            : Array.from([...expReq]).filter((el: string) => el.length > 1).join(Constants.COMPOSITION_DELIMITER);
        }
        if (eduReq.size > 0) {
            job.requiredEducation = job.requiredEducation
            ? job.requiredEducation + Constants.COMPOSITION_DELIMITER + Array.from([...eduReq]).filter((el: string) => el.length > 1).join(Constants.COMPOSITION_DELIMITER)
            : Array.from([...eduReq]).filter((el: string) => el.length > 1).join(Constants.COMPOSITION_DELIMITER);
        }

        return selectedJobProperty.join(Constants.COMPOSITION_DELIMITER);
    }

    /**
   * @description Function which formats salary to x-y PLN/month format.
   * Function then returns the resulting value.
   * @param {string} salary
   * @returns {string}
   */
    private formatSalary(salary: string): string {
        let finalSalary = Constants.EMPTY_STRING;
        let [wasPrevDigit, isCurDigit] = [false, false];
        for(let i = 0; i < salary?.length; i++) {
            if (!isNaN(parseInt(salary[i]))) {
                isCurDigit = true;
                finalSalary += salary[i];
                continue;
            }

            wasPrevDigit = isCurDigit;
            isCurDigit = false;

            if (wasPrevDigit && !isNaN(parseInt(salary[i + 1]))) {
                finalSalary += Constants.DOT;
            } else if (salary[i + 1] == Constants.P) {
                finalSalary += Constants.WHITESPACE + Constants.PLN.toUpperCase() + Constants.SLASH + Constants.MONTH;
                break;
            } else if (wasPrevDigit && salary[i] === Constants.WHITESPACE) {
                continue;
            } else if (salary[i] === Constants.WHITESPACE) {
                continue;
            } else {
                finalSalary += Constants.MINUS_SIGN;
            }
        }
        
        return finalSalary;
    }
}
