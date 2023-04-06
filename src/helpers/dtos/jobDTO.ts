import { JobAdDTO } from "./jobAdDTO";
import OrganizationDTO from "./organizationDTO";

// TODO: trim this class
export default class JobDTO {
    id?: number;
    jobTitle: string;
    postedDate?: Date;
    postedDateTimestamp?: number;
    applicationDeadline?: Date;
    applicationDeadlineTimestamp?: number;
    startDate?: string;
    timeEngagement?: string;
    salary?: string;
    nOfApplicants?: string;
    workLocation?: string;
    details?: string;
    description: string;
    isRemote?: boolean;
    isHybrid?: boolean;
    isInternship?: boolean;
    isStudentPosition?: boolean;
    requiredLanguages?: string;
    requiredSkills?: string;
    requiredExperience?: string;
    requiredEducation?: string;
    goodToHaveSkills?: string;
    requirements?: string;
    benefits?: string;
    equipmentProvided?: string;
    responsibilities?: string;
    additionalJobLink?: string;
    euWorkPermitRequired?: boolean;

    organization: OrganizationDTO;
    jobAd?: JobAdDTO;

    jobAdId?: number;
}
