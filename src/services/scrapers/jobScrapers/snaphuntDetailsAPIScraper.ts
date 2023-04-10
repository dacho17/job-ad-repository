import axios from 'axios';

import { Service } from "typedi";
import { JobAd } from '../../../database/models/jobAd';
import { Organization } from '../../../database/models/organization';
import constants from '../../../helpers/constants';
import Constants from '../../../helpers/constants';
import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobApiScraper from '../interfaces/IJobApiScraper';

@Service()
export default class SnaphuntScraper implements IJobApiScraper {
    /**
   * @description Function that accepts jobAd or jobUrl.
   * Data available on Snaphunt in the scrape is (jobTitle, description, requiredExperience, workLocation,
   * organization.name, organization.size, organization.industry, organization.location, isRemote, timeEngagement, salary,
   * organization.logo, organization.website, organization.description, organization.urlReference
   * @param {JobAd | null} jobAd
   * @param {string?} jobUrl
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAd: JobAd | null, jobUrl?: string): Promise<JobDTO | null> {    
        let url = jobAd?.jobLink ?? jobUrl;
        let jsonResponse = null;
        try {
            console.log(`accessing ${url}`);
            jsonResponse = await axios(url!);
        } catch(exception) {
            console.log(`An exception occurred while accessing the url=${exception}!`);
            jobAd!.isAdPresentOnline = false;
            return null;
        }

        const data = JSON.parse(JSON.stringify(jsonResponse.data)).body;

        if (!data) {
            console.log(`Data has not been fetched from url=${url}!`);
            jobAd!.isAdPresentOnline = false;
            return null;
        }

        const companyInfo = data.user[0].companiesInformation[0];

        const remoteLocationStr = data.remoteLocation.countries.join(Constants.COMPOSITION_DELIMITER);

        const newJob: JobDTO = {
            jobTitle: data.jobListing.jobTitle,
            url: jobAd?.jobLink ?? jobUrl!,
            description: data.jobListing.offerDescription +
                data.jobListing.roleDescription +
                data.jobListing.candidateDescription +
                data.jobListing.employerDescription,
            jobAdId: jobAd?.id ?? undefined,
            requiredExperience: this.getRequiredExperienceStr(data.minimumYearsOfExperience),
            workLocation: remoteLocationStr,
            isRemote: remoteLocationStr.length > 0 || data.jobLocationType === constants.REMOTE,
            salary: data.showSalary 
                ? `${data.minSalary + constants.MINUS_SIGN + data.maxSalary} ${data.currency}/${this.getSalaryPeriod(data.salaryTimePeriod)}`
                : undefined,

            organization: {
                name: companyInfo.companyName,
                size: companyInfo.companySize,
                // industry: companyInfo.companyType,  NOTE: not a valid mapping. Think about whether to use or drop this
                location: `${companyInfo.address.replace(Constants.SNAPHUNT_REDUNDANT_ADDRESS_MARK, Constants.EMPTY_STRING)} - ${companyInfo.zipCode} - ${companyInfo.city} - ${companyInfo.country}`,
                logo: companyInfo.companyLogo,
                website: companyInfo.companyWebsite,
                description: companyInfo.companyDescription,
                urlReference: companyInfo.linkedInURL,
            } as Organization,
        }

        this.handleTimeEngagement(newJob, data.jobType, data.jobEngagement);

        return newJob;

    }

    /**
   * @description Function that returns a string used in assemblying requiredExperience property,
   * @param {string} salaryPeriod
   * @returns {string}
   */
    private getSalaryPeriod(salaryPeriod: string): string {
        let lowerCased = salaryPeriod.toLowerCase();
        if (lowerCased.indexOf(constants.DAY) !== - 1) {
            return constants.DAY;
        } else if (lowerCased.indexOf(constants.WEEK) !== -1) {
            return constants.WEEK;
        } else if (lowerCased.indexOf(constants.MONTH) !== - 1) {
            return constants.MONTH;
        } else if (lowerCased.indexOf(constants.ANNUM) !== - 1) {
            return constants.YEAR;
        }
        return constants.EMPTY_STRING;
    }

    /**
   * @description Function that returns a string describing required experience.
   * @param {string} minYearsOfExp
   * @returns {string | undefined}
   */
    private getRequiredExperienceStr(minYearsOfExp: number): string | undefined {
        if (isNaN(minYearsOfExp)) return undefined;

        if (minYearsOfExp === 0) return constants.ENTRY_LEVEL;
        return `At least ${minYearsOfExp} ${minYearsOfExp === 1 ? constants.YEAR : constants.YEARS}`;
    }

     /**
   * @description Function that sets jobType and jobEngagement to timeEngagement property on JobDTO
   * @param {JobDTO} newJob
   * @param {string} jobType
   * @param {string} jobEngagement
   * @returns {void}
   */
    private handleTimeEngagement(newJob: JobDTO, jobType: string, jobEngagement: string): void {
        let timeEngagements = [];
        if (jobEngagement === constants.SNAPHUNT_FULLTIME) timeEngagements.push(Constants.FULL_TIME);
        timeEngagements.push(jobType);

        newJob.timeEngagement = timeEngagements.join(Constants.COMPOSITION_DELIMITER);
    }
}
