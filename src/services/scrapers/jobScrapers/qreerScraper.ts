import { Inject, Service } from "typedi";
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
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Qreer in the scrape is (jobTitle, organization.name, organization.location, organization.urlReference, jobDescription, applicationDeadline, requiredSKills, isInternship, workLocation, requiredEducation, requiredExperience, requiredLanguages and requiredSkills).
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, browserAPI: BrowserAPI): Promise<JobDTO> {    
        const jobTitle = await browserAPI.getText(Constants.QREER_DETAILS_JOB_TITLE_SELECTOR);
        const orgName = await browserAPI.getText(Constants.QREER_DETAILS_COMPANY_NAME_SELECTOR);
        const orgLocation = await browserAPI.getText(Constants.QREER_DETAILS_COMPANY_LOCATION_SELECTOR);

        const jobDescriptionElements = await browserAPI.findElements(Constants.QREER_DETAILS_JOB_DESCRIPTION_SELECTOR);
        let jobDescription = Constants.EMPTY_STRING;
        for (let i = 0; i < jobDescriptionElements.length; i++) {
            const descriptionPart = await browserAPI.getTextFromElement(jobDescriptionElements[i]);
            jobDescription += descriptionPart + '\n';
        }

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId ?? undefined,
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
        console.log(`Job details elements have been found = ${!!jobDetailsElements}`)
        if (!jobDetailsElements) return;
        
        const isInternshipKeyEl = await browserAPI.findElementOnElement(jobDetailsElements[0], Constants.SPAN_SELECTOR);
        if (isInternshipKeyEl) {
            let isInternshipKey = await browserAPI.getTextFromElement(isInternshipKeyEl);
            let isInternshipValue = await browserAPI.getTextFromElement(jobDetailsElements[0]);
            
            if (isInternshipKey && isInternshipValue) {
                isInternshipKey = isInternshipKey.trim();
                isInternshipValue = isInternshipValue.replace(isInternshipKey, Constants.EMPTY_STRING).trim();
                console.log(`isinternship key value = ${isInternshipKey}`);
                console.log(`isinternship value value = ${isInternshipValue}`);
                newJob.isInternship = isInternshipKey === Constants.TYPE_COL && isInternshipValue === Constants.JOB
                    ? false
                    : undefined;
                console.log(`Value of isInternship on jobAD is now ${newJob.isInternship}`);
            }
        }

        const deadlineEl = await browserAPI.findElementOnElement(jobDetailsElements[1], Constants.SPAN_SELECTOR);
        if (deadlineEl) {
            let deadlineKey = await browserAPI.getTextFromElement(deadlineEl);
            let deadlineValue = await browserAPI.getTextFromElement(jobDetailsElements[1]);

            if (deadlineKey && deadlineValue) {
                deadlineKey = deadlineKey.trim();
                deadlineValue = deadlineValue.replace(deadlineKey, Constants.EMPTY_STRING).trim();
                console.log(`deadlineKey value = ${deadlineKey}`);
                console.log(`deadlineValue value = ${deadlineValue}`);
                const deadline: Date | null = deadlineKey === Constants.DEADLINE_COL 
                    ? this.utils.transformQreerDate(deadlineValue)
                    : null;
                console.log(`Value of deadline before transforming to date is ${deadline}`);
                newJob.applicationDeadline = deadline || undefined;
                console.log(`Value of deadline on jobAD is now ${newJob.applicationDeadline}`);
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
        let educationReq = [];
        for (let i = 0; i < keyValPairElements.length; i++) {
            const [keyElement, valElement] = await browserAPI.findElementsOnElement(keyValPairElements[i], Constants.TD_SELECTOR);
            const jobDetailsKey = await browserAPI.getTextFromElement(keyElement);
            const jobDetailsValSection =await browserAPI.getInnerHTML(valElement);
            const jobDetailVals = jobDetailsValSection?.trim().split(Constants.LESS_SIGN + Constants.BR_SELECTOR + Constants.MORE_SIGN)
                .map(part => part.trim()).join(Constants.COMMA + Constants.WHITESPACE);

            switch (jobDetailsKey?.trim()) {
                case Constants.EDUCATION_COL:
                case Constants.EDUCATION_LEVEL_COL:
                    educationReq.push(jobDetailVals?.trim());
                    break;
                case Constants.SPECIALTIES_COL:
                    newJob.requiredSkills = jobDetailVals?.trim();
                    break;
                case Constants.EXPERIENCE_COL:
                    newJob.requiredExperience = jobDetailVals?.trim();
                    break;
                case Constants.LANGUAGES_SPOKEN_COL:
                    newJob.requiredLanguages = jobDetailVals?.trim();
                    break;
                case Constants.JOB_LOCATION_COL:
                    newJob.workLocation = jobDetailVals?.trim();   
                    break;
            }
        }

        newJob.requiredEducation = educationReq.join(Constants.COMMA + Constants.WHITESPACE);
    }
}
