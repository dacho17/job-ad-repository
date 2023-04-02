import { Service } from "typedi";
import db from '../../database/db';
import { Job } from "../../database/models/job";
import JobDTO from "../dtos/jobDTO";

@Service()
export default class JobMapper {
    /**
   * @description Function which maps JobDTO to JobMAP.
   * @param {JobDTO} jobDTO
   * @returns {Job}
   */
    public toMap(jobDTO: JobDTO): Job {
        const jobMAP = db.Job.build({
            jobTitle: jobDTO.jobTitle,
            postedDate: jobDTO.postedDate,
            timeEngagement: jobDTO.timeEngagement,
            salary: jobDTO.salary,
            nOfApplicants: jobDTO.nOfApplicants,
            workLocation: jobDTO.workLocation,
            details: jobDTO.details,
            description: jobDTO.description,
            isRemote: jobDTO.isRemote,
            isInternship: jobDTO.isInternship,
            deadline: jobDTO.deadline,
            requiredSkills: jobDTO.requiredSkills,
            additionalJobLink: jobDTO.additionalJobLink,
        
            companyName: jobDTO.companyName,
            companyLocation: jobDTO.companyLocation,
            companyLink: jobDTO.companyLink,
            companyDescription: jobDTO.companyDescription,
            companyDetails: jobDTO.companyDetails,
            companySize: jobDTO.companySize,
            companyFounded: jobDTO.companyFounded,
            companyIndustry: jobDTO.companyIndustry,
            companyWebsite: jobDTO.companyWebsite,

            jobAdId: jobDTO.jobAdId
        });
        return jobMAP;
    }
}
