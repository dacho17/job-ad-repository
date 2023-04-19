import Organization from "./Organization";

export default interface Job {
    id?: number;
    url: string;
    jobTitle: string;
    contactEmails?: string;
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
    description?: string;
    isRemote?: boolean;
    isHybrid?: boolean;
    isInternship?: boolean;
    isStudentPosition?: boolean;
    isTrainingProvided?: boolean;
    requiredLanguages?: string;
    requiredSkills?: string;
    requiredExperience?: string;
    requiredEducation?: string;
    goodToHaveSkills?: string;
    techTags?: string;
    interestTags?: string;
    requirements?: string;
    benefits?: string;
    equipmentProvided?: string;
    responsibilities?: string;
    additionalJobLink?: string;
    euWorkPermitRequired?: boolean;

    organization: Organization;
}
