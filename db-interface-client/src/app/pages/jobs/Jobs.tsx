import { Box } from "@mui/material";
import JobTable from "../../components/jobTable/JobTable";
import LoadingComponent from "../../components/loadingComponent/LoadingComponent";
import PageTitle from "../../components/pageTitle/PageTitle";
import AppPagination from "../../components/pagination/Pagination";
import SearchRow from "../../components/searchRow/SearchRow";
import { useAppSelector } from "../../services/store";


const JOBS_PAGE_TITLE = "Job Ads";

export default function JobsPage() {
    const { loading, jobs } = useAppSelector(state => state.repository);

    return (
        <Box sx={{ width: "75%", margin: "auto" }}>
            <PageTitle title={JOBS_PAGE_TITLE} />
            <SearchRow />
            {loading && <LoadingComponent />}
            {!loading && jobs != null && <Box>
                <JobTable />
                <AppPagination />
            </Box>}
        </Box>
    );
}
