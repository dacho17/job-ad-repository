import { Inject, Service } from "typedi";
import db from '../../database/db';
import { Job } from "../../database/models/job";
import { JobAd } from "../../database/models/jobAd";
import { Organization } from "../../database/models/organization";
import JobDTO from "../dtos/jobDTO";
import Utils from "../utils";
import { JobAdMapper } from "./jobAdMapper";
import OrganizationMappper from "./organizationMapper";

@Service()
export default class JobMapper {
    @Inject()
    private utils: Utils;
    @Inject()
    private organizationMapper: OrganizationMappper;
    @Inject()
    private jobAdMapper: JobAdMapper;

    /**
   * @description Function which maps JobDTO to JobMAP.
   * @param {JobDTO} jobDTO
   * @returns {Job}
   */
    public toMap(jobDTO: JobDTO): Job {
        const jobMAP = db.Job.build({
            jobTitle: jobDTO.jobTitle,
            url: jobDTO.url,
            postedDateTimestamp: this.utils.transformToTimestamp(jobDTO.postedDate?.toString() || null) ?? undefined,
            applicationDeadlineTimestamp: this.utils.transformToTimestamp(jobDTO.applicationDeadline?.toString() || null) ?? undefined,
            postedDate: jobDTO.postedDate,
            startDate: jobDTO.startDate,
            
            timeEngagement: jobDTO.timeEngagement,
            salary: jobDTO.salary,
            benefits: jobDTO.benefits,
            nOfApplicants: jobDTO.nOfApplicants,
            workLocation: jobDTO.workLocation,
            details: jobDTO.details,
            description: jobDTO.description,
            isRemote: jobDTO.isRemote,
            isHybrid: jobDTO.isHybrid,
            isTrainingProvided: jobDTO.isTrainingProvided,
            isInternship: jobDTO.isInternship,
            isStudentPosition: jobDTO.isStudentPosition,
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
            id: jobMAP.id,
            jobTitle: jobMAP.jobTitle,
            url: jobMAP.url,
            postedDateTimestamp: jobMAP.postedDateTimestamp,
            applicationDeadlineTimestamp: jobMAP.applicationDeadlineTimestamp,
            postedDate: jobMAP.postedDate,
            startDate: jobMAP.startDate,
            nOfApplicants: jobMAP.nOfApplicants,
            salary: jobMAP.salary,
            benefits: jobMAP.benefits,
            timeEngagement: jobMAP.timeEngagement,
            workLocation: jobMAP.workLocation,
            isRemote: jobMAP.isRemote,
            isHybrid: jobMAP.isHybrid,
            isTrainingProvided: jobMAP.isTrainingProvided,
            isInternship: jobMAP.isInternship,
            isStudentPosition: jobMAP.isStudentPosition,
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

            organization: jobMAP.organization
                ? this.organizationMapper.toDTO(jobMAP.organization)
                : {} as Organization,
            jobAd: jobMAP.jobAd
                ? this.jobAdMapper.toDto(jobMAP.jobAd)
                : {} as JobAd,
        };
        
        return jobDTO;
    }
}
