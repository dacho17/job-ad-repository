import axios from 'axios';

import { Service } from "typedi";
import Constants from '../../../helpers/constants';
import JobDTO from "../../../helpers/dtos/jobDTO";
import IJobApiScraper from '../interfaces/IJobApiScraper';

@Service()
export default class SnaphuntScraper implements IJobApiScraper {
    /**
   * @description Function that accepts jobAdId which link is being scraped, and browserAPI.
   * Data available on Snaphunt in the scrape is (jobTitle, description, requiredSkills, workLocation,
   * companyName, companySize, companyIndustry, companyLocation, isRemote, details, timeEngagement, salary,
   * companyLogo, companyWebsite, companyDescription, companyLink
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

        const remoteLocationStr = JSON.stringify(data.remoteLocation).trim();
        const newJob: JobDTO = {
            jobTitle: data.jobListing.jobTitle,
            description: data.jobListing.offerDescription +
                data.jobListing.roleDescription +
                data.jobListing.candidateDescription +
                data.jobListing.employerDescription,
            jobAdId: jobAdId ?? undefined,
            requiredSkills: 'Minimum ' +  data.minimumYearsOfExperience + ' years of experience',
            workLocation: data.jobLocationType 
                + JSON.stringify(data.location)
                + remoteLocationStr,
            isRemote: remoteLocationStr.length > 0,
            details: data.jobType,
            timeEngagement: data.jobEngagement,
            salary: data.showSalary ? data.minSalary + '-' + data.maxSalary + data.currency : undefined,

            companyName: companyInfo.companyName,
            companySize: companyInfo.companySize,
            companyIndustry: companyInfo.companyType,
            companyLocation: `${companyInfo.address.replace(Constants.SNAPHUNT_REDUNDANT_ADDRESS_MARK, Constants.EMPTY_STRING)} - ${companyInfo.zipCode} - ${companyInfo.city} - ${companyInfo.country}`,
            companyLogo: companyInfo.companyLogo,
            companyWebsite: companyInfo.companyWebsite,
            companyDescription: companyInfo.companyDescription,
            companyLink: companyInfo.linkedInURL,
        }

        return newJob;

    }
}
