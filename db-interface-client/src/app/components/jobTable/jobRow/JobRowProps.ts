export default interface JobRowProps {
    jobTitle: string;
    postedDate?: Date;
    applicationDeadline?: Date;
    timeEngagement?: string;
    isInternship?: boolean;
    isRemote?: boolean;
    workLocation?: string;
    salary?: string;
    nOfApplicants?: string;
    requiredSkills?: string;
    details?: string;
}
