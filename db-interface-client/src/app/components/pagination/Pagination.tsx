import { useSearchParams, useNavigate } from "react-router-dom";
import { setPageNumber } from "../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import './Pagination.css';
import PaginationButton from "./paginationButton/PaginationButton";


export default function AppPagination() {
    const { page, jobs, batchSize } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();
    let navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();

    function handlePageChange(newPage: number) {
        console.log(`new page is page=${newPage}`);
        console.log(`new page as string is page=${newPage.toString()}`);

        searchParams.set("jobTitle", searchParams.get("jobTitle") || "");
        searchParams.set("orgName", searchParams.get("orgName") || "");
        searchParams.set("pageNumber", newPage.toString());

        dispatch(setPageNumber({
            pageNumber: newPage
        }));
        navigate(`/jobs?${searchParams.toString()}`);
    }

    function getButton(increment: number) {
        return <PaginationButton
            key={page + increment + 1}
            pageNumber={page + increment + 1}
            isDisabled={increment === 0}
            onClickFn={() => handlePageChange(page + increment)}
        />
    }

    let buttons = [getButton(0)];
    if (page > 0) {
        buttons.unshift(getButton(-1));
    }
    if (jobs?.length === batchSize) {
        buttons.push(getButton(1));
    }

    return <div className="pagination-row">
        <div className="pagination-row__content">
            {buttons}
        </div>
    </div>
}
