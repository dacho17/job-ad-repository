// TODO: trim this class
export default class JobDTO {
    jobTitle: string;
    postedDate?: Date;
    timeEngagement?: string;
    salary?: string;
    nOfApplicants?: string;
    workLocation?: string;
    startDate?: Date;
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
    deadline?: Date;

    companyName: string;
    companyLocation?: string;
    companyLink?: string;
    companyLogo?: string;
    companyDescription?: string;
    companyDetails?: string;
    companySize?: string;
    companyFounded?: string;
    companyIndustry?: string;
    companyWebsite?: string;

    jobAdId?: number;
}
