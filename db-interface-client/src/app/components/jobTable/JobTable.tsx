import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppSelector } from "../../services/store";
import JobRow from "./jobRow/JobRow";


const TABLE_HEADER: string[] = [

];

export default function JobTable() {
    const { jobs } = useAppSelector(state => state.repository);

    return (
        <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {TABLE_HEADER.map(heading =>
                            <TableCell>
                                {heading}
                            </TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {jobs?.map((job, index) => (
                        <JobRow
                            key={index}
                            {...{
                                jobTitle: job.jobTitle,
                                
                            }}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
