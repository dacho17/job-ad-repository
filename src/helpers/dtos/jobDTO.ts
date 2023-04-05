import OrganizationDTO from "./organizationDTO";

// TODO: trim this class
export default class JobDTO {
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
    isInternship?: boolean;
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

    jobAdId?: number;
}
