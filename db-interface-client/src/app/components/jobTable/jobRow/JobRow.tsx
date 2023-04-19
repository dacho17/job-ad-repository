import { useNavigate } from "react-router-dom";
import Job from "../../../../dtos/Job";
import { setDisplayedJob } from "../../../services/slices/RepositorySlice";
import { useAppDispatch } from "../../../services/store";

export default function JobRow(job: Job) {
    let navigate = useNavigate();
    const dispatch = useAppDispatch();

    function openJobPage(job: Job) {
        dispatch(setDisplayedJob({
            job: job
        }));
        navigate(`/job/${job.id}`);
    }

    return (
        <tr
            className="job-table__row"
            onClick={() => openJobPage(job)}
        >
            <td className="job-table__cell">{job.jobTitle}</td>
            <td className="job-table__cell">{job.organization.name}</td>
            <td className="job-table__cell">{job.workLocation}</td>
            <td className="job-table__cell">{job.salary}</td>
            <td className="job-table__cell">{job.timeEngagement}</td>
        </tr>
    );
}
