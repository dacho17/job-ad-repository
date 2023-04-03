import { TableCell, TableRow } from "@mui/material";
import './JobRow.css';
import JobRowProps from "./JobRowProps";


export default function JobRow(jobRow: JobRowProps) {
    // const dispatch = useAppDispatch();
    // let navigate = useNavigate();

    // function handleFetchPackageDetails(name: string) {    
    //     dispatch(fetchPackageDetailsAsync(name));
    //     navigate(`/package/${name}`); 
    // }

    return (
        <TableRow className="job-table-row">
            <TableCell>{jobRow.jobTitle}</TableCell>
            <TableCell>{jobRow.postedDate?.toString()}</TableCell>
            <TableCell>{jobRow.deadline?.toString()}</TableCell>
            <TableCell>{jobRow.timeEngagement}</TableCell>
            <TableCell>{jobRow.isInternship}</TableCell>
            <TableCell>{jobRow.isRemote}</TableCell>
            <TableCell>{jobRow.workLocation}</TableCell>
            <TableCell>{jobRow.salary}</TableCell>
            <TableCell>{jobRow.nOfApplicants}</TableCell>
            <TableCell>{jobRow.salary}</TableCell>
            <TableCell>{jobRow.details}</TableCell>
        </TableRow>
    );
}
