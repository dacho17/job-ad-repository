import Constants from "../../assets/constants";
import { useAppSelector } from "../../services/store";
import JobRow from "./jobRow/JobRow";
import './JobTable.css';


const TABLE_HEADER: string[] = [
    Constants.JOB_TITLE,
    'Company Name',
    Constants.WORK_LOCATION,
    Constants.SALARY,
    Constants.TIME_ENGAGEMENT,
];

export default function JobTable() {
    const { jobs } = useAppSelector(state => state.repository);
    return (
        <div className="table-container">
            <table className="job-table">
                <tr className="job-table__header">
                    {TABLE_HEADER.map((heading, index) =>
                        <th className="job-table__header-cell"
                            key={index}>
                            {heading}
                        </th>
                    )}
                </tr>
                {jobs?.map((job, index) => (
                    <JobRow
                        key={index}
                        {...job}
                    />
                ))}
            </table>
        </div>
        
    );
}
