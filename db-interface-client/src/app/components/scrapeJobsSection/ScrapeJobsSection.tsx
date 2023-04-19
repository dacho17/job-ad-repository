import { useEffect } from "react";
import { TaskType } from "../../../enums/taskType";
import { getJobScrapingTasks, scrapeJobs } from "../../services/slices/AdminRepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import Button from "../ctaButton/CtaButton";
import LoadingComponent from "../loadingComponent/LoadingComponent";
import TaskTable from "../taskTable/TaskTable";

export default function ScrapeJobsSection() {
    const { jobAdScrapingResponseMsg, isJobAdScrapingMsgError, jobTaskOffset, areTasksLoading } = useAppSelector(state => state.adminDashboard);
    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(getJobScrapingTasks(jobTaskOffset));
    }, [jobTaskOffset, dispatch]);

    function showResponseMessage() {
        if (!jobAdScrapingResponseMsg) return;

        let className = isJobAdScrapingMsgError 
            ? 'gen-form-input__error-msg'
            : 'gen-form-input__success-msg'

        return <span className={className}>{jobAdScrapingResponseMsg}</span>;
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "30px"
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flext-start",
                marginTop: "30px",
                width: "30%"
            }}>
                <div>Start scraping jobs which are unscraped yet</div>
                <Button
                    label="Start"
                    isDisabled={false}
                    actionFn={() => dispatch(scrapeJobs())}/>
                {showResponseMessage()}
            </div>
            {areTasksLoading ? <LoadingComponent /> : <TaskTable taskType={TaskType.JOB_SCRAPE} /> }    
        </div>
    );
}
