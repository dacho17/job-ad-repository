import { Box, Pagination, Typography } from "@mui/material";
import { fetchJobsAsync, ROWS_PER_PAGE, setPageNumber } from "../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import './Pagination.css';


function AppPagination() {
    const { page, totalEntries } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();

    function handlePageChange(page: number) {
        dispatch(setPageNumber(page));
        dispatch(fetchJobsAsync());
    }

    return (
        <Box className="pagination-row">
            <Typography>
                Displaying&nbsp;{page * ROWS_PER_PAGE + 1}-
                {page * ROWS_PER_PAGE > totalEntries
                    ? totalEntries
                    : (page + 1) * ROWS_PER_PAGE }&nbsp;of
                &nbsp;{totalEntries}&nbsp;items
            </Typography>
            <Pagination
                color="secondary"
                size="large"
                count={Math.ceil(totalEntries / ROWS_PER_PAGE)}
                page={page + 1}
                onChange={(e, page: number) => handlePageChange(page - 1)}
            />
        </Box>
    );
}

export default AppPagination;
