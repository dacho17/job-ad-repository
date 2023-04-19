import { FaBusinessTime, FaUserGraduate } from 'react-icons/fa';
import { GoLocation } from 'react-icons/go';
import { AiOutlineGlobal, AiOutlineNumber } from 'react-icons/ai';
import { BsHouseAddFill } from 'react-icons/bs'
import { IoMdBusiness } from 'react-icons/io';
import Job from "../../../dtos/Job";
import './JobDetails.css';
import Button from '../ctaButton/CtaButton';
import { hashCode } from '../../../utils';
import { useNavigate } from 'react-router-dom';

export default function JobDetails(job: Job) {
    const navigate = useNavigate();

    function getTimeEngagementAndWorkLocation() {
        const timeEngagements = job.timeEngagement?.split(", ");
        const workLocations = job.workLocation?.split(", ");

        const isLocationToBeShown = job.isRemote || job.isHybrid || job.workLocation;

        return <>
            <div className="job-details__time-loc-detail">
                <>
                    <FaBusinessTime size={30} className="margin-right-1" />
                    {job.timeEngagement
                        ?   <div className="job-details__multiple-vals">
                                {timeEngagements![0]}
                                <span className="job-details__tooltip">{timeEngagements?.join("\n")}</span>
                            </div>
                        : <span style={{padding: "12px"}}>Time arrangement unknown</span>
                    }
                </>
                </div>

            <div className="job-details__time-loc-detail" style={{
                padding: !isLocationToBeShown ? "2px 10px": "inherit"
            }}>
                <>
                    <GoLocation size={30} className="margin-right-1" />
                    {(!isLocationToBeShown)
                        ? <span>Location undisclosed</span>
                        : <div className="job-details__multiple-vals">{job.isRemote 
                            ? "Remote"
                            : (job.isHybrid)
                                ? `Hybrid - ${job.workLocation}`
                                : workLocations![0]
                            }
                            {job.workLocation &&
                                <span className="job-details__tooltip">{workLocations!.join("\n")}</span>
                            }
                        </div>
                    }
                </>
            </div>
        </>
    }

    function getOrganizationDetails() {
        return <>
            <div className="job-details__job-application-side-card-row margin-bottom-1">
                <div className="job-details__application-detail margin-bottom-2" style={{
                    minWidth: "45%"
                }}>
                    <GoLocation size={30}/>
                    <span>{job.organization.location || "Location unknown"}</span>
                </div>

                <div className="job-details__application-detail margin-bottom-2flex-column__centered" style={{
                    minWidth: "45%"
                }}>
                    <IoMdBusiness size={30}/>
                    <span>{job.organization.industry || "Industry unknown"}</span>
                </div>
            </div>
            <div className="job-details__job-application-side-card-row margin-bottom-1"
                >
                <div className="job-details__application-detail margin-bottom-2" style={{
                    minWidth: "45%"
                }}>
                    <BsHouseAddFill size={30}/>
                    <span>{job.organization.founded || "Founding year not known"}</span>
                </div>                
                <div className="job-details__application-detail margin-bottom-2" style={{
                    minWidth: "45%"
                }}>
                    <AiOutlineNumber size={30}/>
                    <span>{job.organization.size || "Organization size unknown"}</span>
                </div>
            </div>
        </>
    }

    function getJobApplicationDetails() {

        const jobPostedDate = job.postedDate?.toString().split('T')[0];
        const applicationDeadlineDate = job.applicationDeadline?.toString().split('T')[0];
        return <>
            <div className="job-details__job-application-details-column">
                <div className="job-details__application-detail margin-bottom-2">
                    <div>Posted Date:</div>
                    <div>{jobPostedDate ? jobPostedDate : 'Unknown'}</div>
                </div>
                <div className="job-details__application-detail">
                    <div>Start Date:</div>
                    <div>{applicationDeadlineDate ? applicationDeadlineDate : 'Undisclosed'}</div>
                </div>
            </div>
            <div className="job-details__job-application-details-column">
                <div className="job-details__application-detail margin-bottom-2">
                    <span>Application Deadline:</span>
                    <span>{job.applicationDeadline ? job.applicationDeadline?.toString() : 'Undisclosed'}</span>
                </div>
                <div className="job-details__application-detail">
                    <span>Number of applicants:</span>
                    <span>{job.nOfApplicants ? job.nOfApplicants : 'Unknown'}</span>
                </div>
            </div>
        </>
    }

    function getTags(tagListString: string, title: string) {
        return <>
            <div className="content-padding">
                <div className="job-details__section-title margin-bottom-1">{title}</div>
                <div className="job-details__tag-row">
                    {tagListString.split(", ").map((tagName: string, index: number) => {
                    const hash = hashCode(tagName + index.toString());
                    return <>
                        <div
                            className="job-details__tag"
                            key={hash}>
                            {tagName}
                        </div>
                    </>
                    })}
                </div>
            </div>
        </>

    }

    function getBulletpoints(strListOfBulletpoints: string, title: string) {
        return <>
            <div className="job-details__bulletlist content-padding">
                <div className="job-details__section-title margin-bottom-1">{title}</div>
                {strListOfBulletpoints.split(", ").map((point: string, index: number) => {
                    const hash = hashCode(point + index.toString());
                    return <>
                        <li key={hash} className="job-details__bulletpoint">{point}</li>
                </>})}
            </div>
        </>
        
    }

    return (<>
        
        <div className="margin-bottom-2"
        style={{
            width: "100%",
            marginLeft: "20px"
        }}
        ><Button 
            isDisabled={false}
            label="Back to Jobs page"
            actionFn={() => navigate(-1)}
        /></div>
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            width: "100%",
        }}>
            <div className="card" style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignContent: "flex-start",
                width: "65%",
                padding:"12px",

            }}>
                <div className="content-padding">
                    <div id="job-details__job-title" className="margin-bottom-1">{job.jobTitle}</div>
                    <div id="job-details__organization-name"><a href={job.organization.website}>{job.organization.name}</a></div>
                </div>

                <div className="job-details__two-columns-row">
                    <div className="job-details__job-application-details-column">
                        {job.techTags && getTags(job.techTags, "Tech Tags")}
                    </div>
                    
                    <div className="job-details__job-application-details-column">
                        {job.interestTags && getTags(job.interestTags, "Tags of Interest")}
                    </div>
                </div>

                {job.equipmentProvided && getTags(job.equipmentProvided, "Equipment Provided")}
                {job.benefits && getBulletpoints(job.benefits, "Benefits")}

                <div className="job-details__two-columns-row">
                    <div className="job-details__job-application-details-column">
                        {job.requiredSkills && getTags(job.requiredSkills, "Required Skills")}
                    </div>
                    
                    <div className="job-details__job-application-details-column">
                       {job.goodToHaveSkills && getTags(job.goodToHaveSkills, "Good to have Skills")}
                    </div>
                </div>

                {job.requiredLanguages && getTags(job.requiredLanguages, "Required Languages")}
                {job.requiredExperience && getBulletpoints(job.requiredExperience, "Required Experience")}
                {job.requirements && getBulletpoints(job.requirements, "Requirements")}

                {job.responsibilities && getBulletpoints(job.responsibilities, "Job responsibilities")}

                {job.details && <div className="content-padding">
                    <div className="job-details__section-title">Job details</div>
                    <div >{job.details}</div>
                </div>}

                {job.description && <div className="content-padding">
                    <div className="job-details__section-title">Job description</div>
                    <div >{job.description}</div>
                </div>}
                {/* TODO: the value of description is poorly formatted. Consider alternatives? Scrape & deliver in HTML format? */}
            </div>
            <div id="job-details__card-column">
                <div className="card content-padding margin-bottom-3">
                    <div id="job-details__salary" className="margin-bottom-2">{job.salary || 'Salary Not Disclosed'}</div>

                    <div className="job-details__job-application-card-row margin-bottom-3">
                        {(!job.timeEngagement && !job.isRemote && !job.isHybrid && !job.workLocation)
                            ? <div>Engagement Time and Location are unknown for this position</div>
                            : getTimeEngagementAndWorkLocation()
                        }
                    </div>
                    <hr/>

                    {(job.isInternship || job.isStudentPosition || job.isTrainingProvided) && <>
                        <div className="margin-bottom-3">
                            <FaUserGraduate />
                            {job.isInternship && "Internship"}
                            {job.isStudentPosition && "Student position"}
                            {job.isTrainingProvided && "Training provided"}
                        </div>
                        <hr />
                    </>
                    }
                    
                    <div className="job-details__job-application-card-row margin-bottom-2">
                        {(job.postedDate || job.startDate || job.applicationDeadline || job.nOfApplicants)
                            ? getJobApplicationDetails()
                            : "No application details have been disclosed"
                        }
                    </div>
                    <hr />
                    {job.euWorkPermitRequired && <div>EU work permit required</div>}

                    <div className="flex-row__hor-centered content-padding">
                        <Button
                            label='Apply'
                            isDisabled={false}
                            actionFn={() => window.open(job.url)}
                        />
                    </div>
                </div>

                <div className="card content-padding margin-bottom-3">
                    <div id="job-details__organization-name">{job.organization.name}</div>
                    {job.organization.website
                        ? <div>
                            <AiOutlineGlobal size={30} />
                            {job.organization.website}
                        </div>
                        : <div className="margin-bottom-2"/>
                    }
                    
                    <div className="job-details__job-application-card-row margin-bottom-2">
                        {(job.organization.founded || job.organization.industry || job.organization.size || job.organization.location)
                            ? getOrganizationDetails()
                            : "No organization details have been disclosed"
                        }
                    </div>
                    {job.organization.description && 
                        <div>{job.organization.description}</div>
                    }
                </div>
            </div>
        </div>    
    </>
    );
}
