import { useNavigate, useSearchParams } from "react-router-dom";
import { setJobSearchParams } from "../../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../../services/store";
import Button from "../../ctaButton/CtaButton";
import '../SearchRow.css';

const SEARCH_BUTTON_LABEL = "Search";

function SearchButton() {
    const { loading, jobTitleEntered, companyNameEntered } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();

    function handleSearchClick() {
        dispatch(setJobSearchParams({
            jobTitle: jobTitleEntered,
            orgName: companyNameEntered,
            pageNum: 0
        }));
        searchParams.set("jobTitle", jobTitleEntered);
        searchParams.set("orgName", companyNameEntered);
        searchParams.set("pageNumber", "0");

        console.log(`Search click`);
        navigate(`/jobs?${searchParams.toString()}`)
    }

    return (
        <div style={{paddingTop: "6px", width: "100%", minWidth: "120px"}}>
            <Button
                actionFn={() => handleSearchClick()}
                isDisabled={loading}
                label={SEARCH_BUTTON_LABEL} />            
        </div>
    );
}

export default SearchButton;
