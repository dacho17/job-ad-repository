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
            companyLogo: jobDTO.companyLogo,
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

     /**
   * @description Function which maps JobMAP to JobDTO.
   * @param {Job} jobMAP
   * @returns {JobDTO}
   */
     public toDTO(jobMAP: Job): JobDTO {
        const jobDTO: JobDTO = {
            jobTitle: jobMAP.jobTitle,
            postedDate: jobMAP.postedDate,
            timeEngagement: jobMAP.timeEngagement,
            salary: jobMAP.salary,
            nOfApplicants: jobMAP.nOfApplicants,
            workLocation: jobMAP.workLocation,
            details: jobMAP.details,
            description: jobMAP.description,
            isRemote: jobMAP.isRemote,
            isInternship: jobMAP.isInternship,
            deadline: jobMAP.deadline,
            requiredSkills: jobMAP.requiredSkills,
            additionalJobLink: jobMAP.additionalJobLink,
        
            companyName: jobMAP.companyName,
            companyLocation: jobMAP.companyLocation,
            companyLogo: jobMAP.companyLogo,
            companyLink: jobMAP.companyLink,
            companyDescription: jobMAP.companyDescription,
            companyDetails: jobMAP.companyDetails,
            companySize: jobMAP.companySize,
            companyFounded: jobMAP.companyFounded,
            companyIndustry: jobMAP.companyIndustry,
            companyWebsite: jobMAP.companyWebsite,

            jobAdId: jobMAP.jobAdId
        };
        
        db.Job.build({
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
            companyLogo: jobDTO.companyLogo,
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

