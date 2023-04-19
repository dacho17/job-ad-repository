import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../services/store";
import ScrapeJobAdsForm from "../scrapeJobAdsForm/ScrapeJobAdsForm";
import { getJobAdScrapingTasks } from "../../services/slices/AdminRepositorySlice";
import LoadingComponent from "../loadingComponent/LoadingComponent";
import TaskTable from "../taskTable/TaskTable";
import { TaskType } from "../../../enums/taskType";

export default function ScrapeJobAdsSection() {
    const dispatch = useAppDispatch();
    const { areTasksLoading, jobTaskOffset } = useAppSelector(state => state.adminDashboard);

    useEffect(() => {
        dispatch(getJobAdScrapingTasks(jobTaskOffset));
    }, [jobTaskOffset, dispatch]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "30px"
        }}>
            <ScrapeJobAdsForm/>
            {areTasksLoading ? <LoadingComponent /> : <TaskTable taskType={TaskType.JOBAD_SCRAPE} /> }
        </div>
    );
}
