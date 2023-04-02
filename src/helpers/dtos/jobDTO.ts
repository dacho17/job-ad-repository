import Constants from "../constants";

// TODO: trim this class
export default class JobDTO {
    jobTitle: string;
    postedDate?: Date;
    timeEngagement?: string;
    salary?: string;
    nOfApplicants?: string;
    workLocation?: string;
    details?: string;
    description: string;
    isRemote?: boolean;
    isInternship?: boolean;
    requiredSkills?: string;
    additionalJobLink?: string;
    euWorkPermitRequired?: boolean;
    deadline?: Date;

    companyName: string;
    companyLocation?: string;
    companyLink?: string;
    companyDescription?: string;
    companyDetails?: string;
    companySize?: string;
    companyFounded?: string;
    companyIndustry?: string;
    companyWebsite?: string;

    jobAdId: number;
}
