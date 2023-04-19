import { JobAdScrapingTask } from "../../../dtos/JobAdScrapingTask";
import { JobScrapingTask } from "../../../dtos/JobScrapingTask";
import { JobAdScrapingTaskStatus } from "../../../enums/jobAdScrapingTaskStatus";
import { TaskType } from "../../../enums/taskType";
import Constants from "../../assets/constants";
import { getJobAdScrapingTasks } from "../../services/slices/AdminRepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import GenCard from "../genCard/GenCard";
import LoadingComponent from "../loadingComponent/LoadingComponent";
import './TaskTable.css';

interface TaskTableProps {
    taskType: TaskType;
}

function getTaskStatus(status: JobAdScrapingTaskStatus) {
    switch(status) {
        case JobAdScrapingTaskStatus.CREATED:
            return "CREATED";
        case JobAdScrapingTaskStatus.RUNNING:
            return "RUNNING";
        case JobAdScrapingTaskStatus.STOPPED:
            return "STOPPED";
        case JobAdScrapingTaskStatus.FINISHED:
            return "FINISHED";
    }
}


export default function TaskTable({ taskType }: TaskTableProps) {
    const state = useAppSelector(state => state.adminDashboard);
    const [tasks, header] = getTasksAndHeader();
    const dispatch = useAppDispatch();

    function getTasksAndHeader(): [JobAdScrapingTask[] | JobScrapingTask[], string[]] {
        switch(taskType) {
            case TaskType.JOBAD_SCRAPE:
                return [
                    state.jobAdScrapingTasks,
                    // setJobAdScrapingTasks,
                    ['ID', 'Status', 'Start Time', 'End Time', '# scraped items']
                ];
            case TaskType.JOB_SCRAPE:
                return [
                    state.jobScrapingTasks,
                    ['ID', 'Status', 'Start Time', 'End Time',]
                ];
            default:
                return [[], []];
            // case TaskType.JOB_PARSE:
            //     return state.jobParsingTasks;
        }
    }

    function getRow(task: any) {
        return <tr className="task-table__row" key={task.id}>
            <td className="task-table__cell">{task.id}</td>
            <td className="task-table__cell">{getTaskStatus(task.status)}</td>
            <td className="task-table__cell">{task.startTime?.toString() || "The task is starting..."}</td>
            <td className="task-table__cell">{task.endTime?.toString()}</td>
            {taskType === TaskType.JOBAD_SCRAPE
                ? <td className="task-table__cell">{task.numberOfAdsScraped}</td>
                : null}
        </tr>
    }

    const curPage = state.jobTaskOffset / Constants.TASK_TABLE_BATCH_SIZE + 1;

    function getButton(increment: number) {
        return <button
            disabled={increment === 0}
            key={increment}
            onClick={() => {
                dispatch(getJobAdScrapingTasks(state.jobTaskOffset + increment * Constants.TASK_TABLE_BATCH_SIZE));
            }}>
            {curPage + increment}
        </button>
    }

    function getButtons() {
        let buttons = [getButton(0)];
        if (curPage > 1) {
            buttons.unshift(getButton(-1));
        }

        if (tasks?.length === Constants.TASK_TABLE_BATCH_SIZE) {
            buttons.push(getButton(1));
        }
        
        return buttons;
    }

    function getTable() {
        return <>
        <div className="table-container">
            <table className="task-table">
                <tr className="task-table__header">
                    {header.map((heading, index) =>
                        <th className="task-table__header-cell"
                            key={index}>
                            {heading}
                        </th>
                    )}
                </tr>
                {tasks.map(task => {
                    return getRow(task);
                })}
            </table>
        </div>
        <div className="pagination-row" style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
            }}>{getButtons()}
        </div></>
    }

    if (state.areTasksLoading) {
        return <LoadingComponent />
    }

    return (
        <div className="page-container__card-container">
            {(state.jobAdScrapingTasks.length === 0 && state.jobScrapingTasks.length === 0)
                ? <GenCard message={"No tasks to be shown"} />
                : getTable()
            }
        </div>
    );
}
