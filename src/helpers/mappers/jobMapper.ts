import { Inject, Service } from "typedi";
import db from '../../database/db';
import { Job } from "../../database/models/job";
import { Organization } from "../../database/models/organization";
import JobDTO from "../dtos/jobDTO";
import Utils from "../utils";

@Service()
export default class JobMapper {
    @Inject()
    private utils: Utils;

    /**
   * @description Function which maps JobDTO to JobMAP.
   * @param {JobDTO} jobDTO
   * @returns {Job}
   */
    public toMap(jobDTO: JobDTO): Job {
        const jobMAP = db.Job.build({
            jobTitle: jobDTO.jobTitle,
            postedDateTimestamp: this.utils.transformToTimestamp(jobDTO.postedDate?.toString() || null),
            applicationDeadlineTimestamp: this.utils.transformToTimestamp(jobDTO.applicationDeadline?.toString() || null),
            postedDate: jobDTO.postedDate,
            startDate: jobDTO.startDate,
            
            timeEngagement: jobDTO.timeEngagement,
            salary: jobDTO.salary,
            nOfApplicants: jobDTO.nOfApplicants,
            workLocation: jobDTO.workLocation,
            details: jobDTO.details,
            description: jobDTO.description,
            isRemote: jobDTO.isRemote,
            isInternship: jobDTO.isInternship,
            requiredSkills: jobDTO.requiredSkills,
            additionalJobLink: jobDTO.additionalJobLink,
            euWorkPermitRequired: jobDTO.euWorkPermitRequired,
            goodToHaveSkills: jobDTO.goodToHaveSkills,
            requiredExperience: jobDTO.requiredExperience,
            requiredLanguages: jobDTO.requiredLanguages,
            requiredEducation: jobDTO.requiredEducation,
            requirements: jobDTO.requirements,
            responsibilities: jobDTO.responsibilities,
            equipmentProvided: jobDTO.equipmentProvided,

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
            postedDateTimestamp: jobMAP.postedDateTimestamp,
            applicationDeadlineTimestamp: jobMAP.applicationDeadlineTimestamp,
            postedDate: jobMAP.postedDate,
            startDate: jobMAP.startDate,
            nOfApplicants: jobMAP.nOfApplicants,
            salary: jobMAP.salary,
            timeEngagement: jobMAP.timeEngagement,
            workLocation: jobMAP.workLocation,
            isRemote: jobMAP.isRemote,
            isInternship: jobMAP.isInternship,
            euWorkPermitRequired: jobMAP.euWorkPermitRequired,
            requiredSkills: jobMAP.requiredSkills,
            additionalJobLink: jobMAP.additionalJobLink,
            details: jobMAP.details,
            description: jobMAP.description,
            goodToHaveSkills: jobMAP.goodToHaveSkills,
            requiredExperience: jobMAP.requiredExperience,
            requiredEducation: jobMAP.requiredEducation,
            requiredLanguages: jobMAP.requiredLanguages,
            requirements: jobMAP.requirements,
            responsibilities: jobMAP.responsibilities,
            equipmentProvided: jobMAP.equipmentProvided,

            organization: {} as Organization,

            jobAdId: jobMAP.jobAdId
        };
        
        return jobDTO;
    }
}
