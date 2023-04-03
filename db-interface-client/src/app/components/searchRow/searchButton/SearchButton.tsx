import { SearchOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { fetchJobsAsync, setPageNumber, setSearchWord } from "../../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../../services/store";
import '../SearchRow.css';


const SEARCH_BUTTON_LABEL = "Search";

function SearchButton() {
    const { loading, enteredWord } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();

    function handleSearchClick() {
        dispatch(setSearchWord(enteredWord));
        dispatch(setPageNumber(0));
        dispatch(fetchJobsAsync());
    }

    return (
        <Button
            className="search-row-item"
            variant="contained"
            startIcon={<SearchOutlined />}
            onClick={() => handleSearchClick()}
            disabled={loading}>
            {SEARCH_BUTTON_LABEL}
        </Button>
    );
}

export default SearchButton;
