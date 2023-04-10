import { Inject, Service } from "typedi";
import { JobAd } from "../../../database/models/jobAd";
import Constants from "../../../helpers/constants";
import JobDTO from "../../../helpers/dtos/jobDTO";
import OrganizationDTO from "../../../helpers/dtos/organizationDTO";
import Utils from "../../../helpers/utils";
import BrowserAPI from "../../browserAPI";
import IJobBrowserScraper from "../interfaces/IJobBrowserScraper";

@Service()
export default class QreerScraper implements IJobBrowserScraper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function that accepts jobAd, and browserAPI.
   * Data available on Qreer in the scrape is (jobTitle, organization.name, organization.location, organization.urlReference, jobDescription, applicationDeadline, requiredSKills, isInternship, workLocation, requiredEducation, requiredExperience, requiredLanguages and requiredSkills).
   * @param {JobAd | null} jobAd
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, browserAPI: BrowserAPI): Promise<JobDTO | null> {    
        const jobTitle = await browserAPI.getText(Constants.QREER_DETAILS_JOB_TITLE_SELECTOR);
        if (!jobTitle) {
            console.log(`Job Title not found while attempting to scrape the job on url=${browserAPI.getUrl()}`);
            return null;
        }
        const orgName = await browserAPI.getText(Constants.QREER_DETAILS_COMPANY_NAME_SELECTOR);
        const orgLocation = await browserAPI.getText(Constants.QREER_DETAILS_COMPANY_LOCATION_SELECTOR);

        const jobDescriptionElements = await browserAPI.findElements(Constants.QREER_DETAILS_JOB_DESCRIPTION_SELECTOR);
        let jobDescription = Constants.EMPTY_STRING;
        for (let i = 0; i < jobDescriptionElements.length; i++) {
            const descriptionPart = await browserAPI.getTextFromElement(jobDescriptionElements[i]);
            jobDescription += descriptionPart + '\n';
        }

        const newJob: JobDTO = {
            jobTitle: jobTitle.trim(),
            url: browserAPI.getUrl(),
            description: jobDescription.trim(),
            jobAdId: jobAd?.id ?? undefined,
            organization: { name: orgName?.trim(), location: orgLocation?.trim() } as OrganizationDTO,
        }

        await this.scrapeDeadlineAndIsInternship(browserAPI, newJob);
        await this.scrapeJobSkills(browserAPI, newJob);
        await this.scrapeCompanyLink(browserAPI, newJob);
        
        return newJob;
    }

    /**
    * @description Function which scrapes a part of the page, formats it and stores it into the 
    * applicationDeadline and isInternship properties.
    * @param {BrowserAPI} browserAPI
    * @param {JobDTO} newJob
    * @returns {Promise<void>}
    */
    private async scrapeDeadlineAndIsInternship(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const jobDetailsElements = await browserAPI.findElements(Constants.QREER_DETAILS_JOB_DETAILS_SELECTOR);
        if (!jobDetailsElements) return;
        
        const isInternshipKeyEl = await browserAPI.findElementOnElement(jobDetailsElements[0], Constants.SPAN_SELECTOR);
        if (isInternshipKeyEl) {
            let isInternshipKey = await browserAPI.getTextFromElement(isInternshipKeyEl);
            let isInternshipValue = await browserAPI.getTextFromElement(jobDetailsElements[0]);
            
            if (isInternshipKey && isInternshipValue) {
                isInternshipKey = isInternshipKey.trim();
                isInternshipValue = isInternshipValue.replace(isInternshipKey, Constants.EMPTY_STRING).trim();
                newJob.isInternship = isInternshipKey === Constants.TYPE_COL && isInternshipValue === Constants.JOB
                    ? false
                    : undefined;
            }
        }

        const deadlineEl = await browserAPI.findElementOnElement(jobDetailsElements[1], Constants.SPAN_SELECTOR);
        if (deadlineEl) {
            let deadlineKey = await browserAPI.getTextFromElement(deadlineEl);
            let deadlineValue = await browserAPI.getTextFromElement(jobDetailsElements[1]);

            if (deadlineKey && deadlineValue) {
                deadlineKey = deadlineKey.trim();
                deadlineValue = deadlineValue.replace(deadlineKey, Constants.EMPTY_STRING).trim();
                const deadline: Date | null = deadlineKey === Constants.DEADLINE_COL 
                    ? this.utils.transformQreerDate(deadlineValue)
                    : null;
                newJob.applicationDeadline = deadline || undefined;
            }
        }
    }

    /**
    * @description Function which scrapes organization.urlReference, formats it and sets it to the newJob.
    * @param {BrowserAPI} browserAPI
    * @param {JobDTO} newJob
    * @returns {Promise<void>}
    */
    private async scrapeCompanyLink(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        let companyLinkEl = await browserAPI.findElement(Constants.QREER_DETAILS_COMPANY_LINK_SELECTOR);
        if (!companyLinkEl) {
            companyLinkEl = await browserAPI.findElement(Constants.QREER_DETAILS_ALT_COMPANY_LINK_SELECTOR);
        }
        if (companyLinkEl) {
            const orgUrlRef = Constants.QREER_URL + await browserAPI.getDataFromAttr(companyLinkEl, Constants.HREF_SELECTOR);
            newJob.organization.urlReference = orgUrlRef.trim();    
        }
    }

    /**
    * @description Function which scrapes jobSkills part of the page, formats it and stores it into the 
    * workLocation, requiredEducation, requiredExperience, requiredLanguages, and requiredSkills properties.
    * @param {BrowserAPI} browserAPI
    * @param {JobDTO} newJob
    * @returns {Promise<void>}
    */
    private async scrapeJobSkills(browserAPI: BrowserAPI, newJob: JobDTO): Promise<void> {
        const keyValPairElements = await browserAPI.findElements(Constants.QREER_DETAILS_JOB_SKILLS_KEY_VALUE_SELECTOR);
        let educationReq = new Set();
        let requiredSkills = new Set();
        for (let i = 0; i < keyValPairElements.length; i++) {
            const [keyElement, valElement] = await browserAPI.findElementsOnElement(keyValPairElements[i], Constants.TD_SELECTOR);
            const jobDetailsKey = await browserAPI.getTextFromElement(keyElement);
            const jobDetailsValSection =await browserAPI.getInnerHTML(valElement);
            if (!jobDetailsKey || !jobDetailsValSection) continue;

            const jobDetailVals = jobDetailsValSection?.trim().split(Constants.LESS_SIGN + Constants.BR_SELECTOR + Constants.MORE_SIGN)
                .map(part => part.trim()).filter(el => el.length > 0).join(Constants.COMPOSITION_DELIMITER);
            let trimmedKey = jobDetailsKey?.trim();
            let trimmedVal = jobDetailVals?.trim();
            switch (true) {
                case (trimmedVal?.toLowerCase().indexOf(Constants.BACHELOR) !== -1):
                    educationReq.add(Constants.BACHELOR);
                    break;
                case (trimmedVal?.toLowerCase().indexOf(Constants.MASTER) !== -1):
                    educationReq.add(Constants.MASTER);
                    break;
                case (trimmedVal?.toLowerCase().indexOf(Constants.DOCTOR) !== -1):
                    educationReq.add(Constants.DOCTOR);
                    break;
                case (trimmedKey === Constants.EDUCATION_COL):
                case (trimmedKey === Constants.EDUCATION_LEVEL_COL):
                    requiredSkills.add(trimmedVal);
                    break;
                case (trimmedKey === Constants.SPECIALTIES_COL):
                    requiredSkills.add(trimmedVal);
                    break;
                case (trimmedKey === Constants.EXPERIENCE_COL):
                    newJob.requiredExperience = trimmedVal;
                    break;
                case (trimmedKey === Constants.LANGUAGES_SPOKEN_COL):
                    let requiredLangs = trimmedVal?.toLowerCase();
                    newJob.requiredLanguages = requiredLangs;
                    break;
                case (trimmedKey === Constants.JOB_LOCATION_COL):
                    newJob.workLocation = trimmedVal;   
                    break;
            }
        }

        newJob.requiredSkills = Array.from(requiredSkills.values()).join(Constants.COMPOSITION_DELIMITER);
        newJob.requiredEducation = Array.from(educationReq.values()).join(Constants.COMPOSITION_DELIMITER);
    }
}
