import axios from 'axios';

import { Service } from "typedi";
import { Organization } from '../../../database/models/organization';
import Constants from '../../../helpers/constants';
import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobApiScraper from '../interfaces/IJobApiScraper';

@Service()
export default class SnaphuntScraper implements IJobApiScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Snaphunt in the scrape is (jobTitle, description, requiredExperience, workLocation,
   * organization.name, organization.size, organization.industry, organization.location, isRemote, details, timeEngagement, salary,
   * organization.logo, organization.website, organization.description, organization.urlReference
   * @param {number} jobAdId
   * @param {string} jobUrl
   * @returns {Promise<JobDTO>} Returns the a JobDTO.
   */
    public async scrape(jobAdId: number | null, jobUrl: string): Promise<JobDTO> {    
        let jsonResponse = null;
        try {
            console.log(`accessing ${jobUrl}`);
            jsonResponse = await axios(jobUrl);
        } catch(exception) {
            throw `An exception occurred while accessing the url=${exception}!`;
        }

        const data = JSON.parse(JSON.stringify(jsonResponse.data)).body;

        console.log(data);

        const companyInfo = data.user[0].companiesInformation[0];

        const remoteLocationStr = data.remoteLocation.countries.join(Constants.COMMA + Constants.WHITESPACE);
            ;
        const newJob: JobDTO = {
            jobTitle: data.jobListing.jobTitle,
            description: data.jobListing.offerDescription +
                data.jobListing.roleDescription +
                data.jobListing.candidateDescription +
                data.jobListing.employerDescription,
            jobAdId: jobAdId ?? undefined,
            requiredExperience: data.minimumYearsOfExperience + ' years',
            workLocation: remoteLocationStr,
            isRemote: remoteLocationStr.length > 0,
            details: data.jobType,
            timeEngagement: data.jobEngagement,
            salary: data.showSalary ? data.minSalary + '-' + data.maxSalary + data.currency : undefined,

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

        return newJob;

    }
}
