// https://dev.to/salehmubashar/search-bar-in-react-js-545l - this article might help
import { useAppDispatch, useAppSelector } from "../../services/store";
import ActiveSearchChip from "./activeSearchChip/ActiveSearchChip";
import SearchButton from "./searchButton/SearchButton";
import { setCompanyNameEntered, setJobSearchParams, setjobTitleEntered } from '../../services/slices/RepositorySlice';
import './SearchRow.css';
import SearchField from "./searchField/SearchField";
import { useSearchParams } from "react-router-dom";

const JOB_TITLE_SEARCH_LABEL = 'Job Title';
const COMPANY_NAME_SEARCH_LABEL = 'Company Name';

function SearchRow() {
    const { companyNameSearch, jobTitleSearch } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();
    let [searchParams, setSearchParams] = useSearchParams();

    function handleJobTitleReset() {
        setSearchParams({
            pageNumber: "0",
            jobTitle: "",
            orgName: companyNameSearch
        });

        dispatch(setJobSearchParams({
            jobTitle: "",
            orgName: companyNameSearch,
            pageNum: 0
        }));
    }
    
    function handleOrgNameReset() {
        setSearchParams({
            pageNumber: "0",
            jobTitle: jobTitleSearch,
            orgName: ""
        });

        dispatch(setJobSearchParams({
            jobTitle: jobTitleSearch,
            orgName: "",
            pageNum: 0
        }));
    }

    return (
        <div className="search-row" >
            <div className="search-row__search-field">
                <SearchField 
                    placeholder={JOB_TITLE_SEARCH_LABEL}
                    onChangeFn={setjobTitleEntered}
                />
                <div className="margin-bottom-1" />
                {jobTitleSearch !== "" 
                    && <div style={{marginLeft: "20px"}}>
                        <ActiveSearchChip searchedWord={jobTitleSearch} setSearchedWord={handleJobTitleReset} />
                    </div>
                }
            </div>
            <div className="search-row__search-field">
                <SearchField 
                    placeholder={COMPANY_NAME_SEARCH_LABEL}
                    onChangeFn={setCompanyNameEntered}
                />
                <div className="margin-bottom-1" />
                {companyNameSearch !== "" 
                    && <div style={{marginLeft: "20px"}}>
                        <ActiveSearchChip searchedWord={companyNameSearch} setSearchedWord={handleOrgNameReset} />
                    </div>
                }
            </div>
            <SearchButton/>
        </div>
    );
}

export default SearchRow;
