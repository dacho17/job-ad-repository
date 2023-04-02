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
    public async scrape(jobAdId: number, browserAPI: BrowserAPI): Promise<JobDTO> {
        const showMoreButton = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_SHOW_MORE_SELECTOR);
        if (showMoreButton) {
            console.log('show more button found')
            await showMoreButton.click();
        }

        const jobTitle = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_JOB_TITLE_SELECTOR));
        const jobDescription = await this.scrapeJobDescription(browserAPI);
        const locations = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_LOCATION_SELECTOR));
        const companyNameLinkEl = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR);
        const companyLink = await browserAPI.getDataFromAttr(companyNameLinkEl!, Constants.HREF_SELECTOR);
        const companyName = await browserAPI.getTextFromElement(companyNameLinkEl!);

        const newJob: JobDTO = {
            jobTitle: jobTitle!.trim(),
            description: jobDescription!.trim(),
            jobAdId: jobAdId,
            companyName: companyName?.trim() || Constants.UNDISLOSED_COMPANY,
            companyLink: companyLink ? Constants.NO_FLUFF_JOBS_URL + companyLink.trim() : undefined,
            workLocation: locations ?? undefined,
        }

        const postedAgo = await browserAPI.getText((Constants.NO_FLUFF_DETAILS_POSTED_AGO_SELECTOR));
        if (postedAgo) {
            newJob.postedDate = this.utils.getPostedDate4NoFluff(postedAgo.trim());
        }

        const remoteElement = await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_REMOTE_SELECTOR);
        if (remoteElement) {
            newJob.isRemote = true;
        }
        
        const salary = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_SALARY_SELECTOR);
        const companyInfo = await browserAPI.getText(Constants.NO_FLUFF_DETAILS_COMPANY_INFO_SELECTOR);

        const reqSkillsEls = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_REQUIRED_SKILLS_SELECTOR);
        const jobDetailsEls = await browserAPI.findElements(Constants.NO_FLUFF_DETAILS_JOB_DETAILS_SELECTOR);

        let requiredSkills = await Promise.all(await reqSkillsEls.map(async el => await browserAPI.getTextFromElement(el)));
        let jobDetails = await Promise.all(jobDetailsEls.map(async el => await browserAPI.getTextFromElement(el)));
        const requiredSkillsStr = requiredSkills.map(el => el?.trim()).join(Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER);
        const jobDetailsStr = jobDetails.map(el => el?.trim()).join(Constants.JOB_DESCRIPTION_COMPOSITION_DELIMITER);

        newJob.salary = salary?.trim();
        newJob.requiredSkills = requiredSkillsStr;
        newJob.details = jobDetailsStr;
        newJob.companyDescription = companyInfo?.trim();

        return newJob;
    }

    /**
   * @description Function scrapes and formats description from several sections of the noFluff job posting. The description is returned as a string.
   * @param {number} jobAdId
   * @param {BrowserAPI} browserAPI
   * @returns {Promise<string>} Returns jobDescription as string.
   */
    private async scrapeJobDescription(browserAPI: BrowserAPI): Promise<string> {
        const jobDescriptionTotal = [];
        jobDescriptionTotal.push(await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_JOB_REQUIREMENTS_SELECTOR));
        jobDescriptionTotal.push(await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_JOB_DESCRIPTION_SELECTOR));
        jobDescriptionTotal.push(await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_JOB_RESPONSIBILITIES_SELECTOR));
        jobDescriptionTotal.push(await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_EQUIPMENT_SUPPLIED_SELECTOR));
        jobDescriptionTotal.push(await browserAPI.findElement(Constants.NO_FLUFF_DETAILS_JOB_BENEFITS_SELECTOR));
    
        const descriptonTexts = await Promise.all(jobDescriptionTotal.map(async element => await browserAPI.getTextFromElement(element!)));
        const description = descriptonTexts.join('\n');

        return description;
    }
}
