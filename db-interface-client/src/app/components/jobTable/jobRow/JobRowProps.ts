export default interface JobRowProps {
    jobTitle: string;
    postedDate?: Date;
    deadline?: Date;
    timeEngagement?: string;
    isInternship?: boolean;
    isRemote?: boolean;
    workLocation?: string;
    salary?: string;
    nOfApplicants?: string;
    requiredSkills?: string;
    details?: string;
}
