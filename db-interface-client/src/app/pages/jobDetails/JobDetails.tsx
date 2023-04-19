import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ctaButton/CtaButton";
import GenCard from "../../components/genCard/GenCard";
import JobDetails from "../../components/jobDetails/JobDetails";
import LoadingComponent from "../../components/loadingComponent/LoadingComponent";
import { fetchJobAsync, setDisplayedJobId, setLoading } from "../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";

const JOB_NOT_SELECTED = 'Job has not been selected';
const GO_BACK_TO_JOBS = 'Back to jobs';

export default function JobDetailsPage() {
    const { loading, displayedJob, displayedJobId } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();
    let navigate = useNavigate();

    const jobId = window.location.href.split("/");
    console.log(`jobId pulled from href=${jobId[jobId.length - 1]}`);
    const jobIdNum = parseInt(jobId[jobId.length - 1]);
    console.log(`JobId accessed through url =${jobIdNum}, displayedJobId = ${displayedJobId}`);
    if (jobIdNum !== displayedJobId) {
        setLoading({
            isLoading: true
        });
        console.log(`Dispatching setDisplayedJobId ${jobIdNum}`);
        dispatch(setDisplayedJobId({ jobId: jobIdNum }));
    }

    useEffect(() => {
        console.log(`In use effect - displayedJobId = ${displayedJobId}`);
        if (displayedJobId && displayedJobId === jobIdNum) {
            console.log('fetching the job!')
            dispatch(fetchJobAsync(displayedJobId));
        }
    }, []);

    if (!loading && !displayedJob) {
        return (
            <div>
                <GenCard message={JOB_NOT_SELECTED} />
                <Button
                    label={GO_BACK_TO_JOBS}
                    isDisabled={false}
                    actionFn={() => navigate('/jobs')}/>                    
            </div>
        );
    }

    return (
        <div style={{ width: "100%", margin: "auto" }}>
            <div style={{
                marginBottom: "20px",
                marginTop: "20px",
                padding: "4%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
                }}>
                {loading && <div className="page-container__card-container"><LoadingComponent /></div>}
                {!loading && displayedJob && <JobDetails {...displayedJob!} />}
            </div>
        </div>
    );
}
