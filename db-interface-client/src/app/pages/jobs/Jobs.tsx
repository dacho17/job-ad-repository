import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GenCard from "../../components/genCard/GenCard";
import JobTable from "../../components/jobTable/JobTable";
import LoadingComponent from "../../components/loadingComponent/LoadingComponent";
import AppPagination from "../../components/pagination/Pagination";
import SearchRow from "../../components/searchRow/SearchRow";
import { fetchJobsAsync, setJobSearchParams } from "../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import './Jobs.css';

export default function JobsPage()  {
    const { loading, jobs, page, companyNameSearch, jobTitleSearch, errorMessage } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();
    let [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const pageNumber = searchParams.get("pageNumber");
        const jobTitle = searchParams.get("jobTitle");
        const orgName = searchParams.get("orgName");

        setSearchParams({
            pageNumber: pageNumber || "0",
            orgName: orgName || "",
            jobTitle: jobTitle || ""
        });

        dispatch(setJobSearchParams({
            jobTitle: jobTitle || "",
            orgName:  orgName || "",
            pageNum: pageNumber ? parseInt(pageNumber) : 0
        }));

        dispatch(fetchJobsAsync());
    }, [page, companyNameSearch, jobTitleSearch]);

    return (
        <div className="page-container">
            <div className="page-container__content">
                <SearchRow />
                {errorMessage && <div className="page-container__card-container"><GenCard message={errorMessage} /></div>}
                {!errorMessage && loading && <div className="page-container__card-container"><LoadingComponent/></div>}
                {!loading && jobs != null && <>
                    <JobTable />
                    <AppPagination />
                </>}            
            </div>
        </div>
    );
}
