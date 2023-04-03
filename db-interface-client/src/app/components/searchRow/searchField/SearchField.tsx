import { InputBase } from "@mui/material";
import { setEnteredWord } from "../../../services/slices/RepositorySlice";
import { useAppDispatch } from "../../../services/store";
import '../SearchRow.css';


const SEARCH_LABEL = "Search packages...";

function SearchField() {
    const dispatch = useAppDispatch();
    
    return (
        <InputBase
            className="search-row-item"
            placeholder={SEARCH_LABEL}
            onChange={(e) => dispatch(setEnteredWord(e.target.value))}
            sx={{ padding: "7px", width: "250px", height: "6vh", border: "2px solid grey", borderRadius: "20px" }}
        />
    );
}

export default SearchField;
