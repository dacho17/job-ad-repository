import { Chip, Tooltip } from "@mui/material";
import { setJobs, setPageNumber, setSearchWord } from "../../../services/slices/RepositorySlice";
import { useAppDispatch, useAppSelector } from "../../../services/store";
import '../SearchRow.css';


function ActiveSearchChip() {
    const { searchedWord } = useAppSelector(state => state.repository);
    const dispatch = useAppDispatch();

    function handleOnDelete() {
        dispatch(setSearchWord(""));
        dispatch(setPageNumber(0));
        dispatch(setJobs(null));
    }
    
    return (
        <Tooltip title={searchedWord}>
            <Chip
                className="search-row-item"
                label={searchedWord}
                variant="outlined"
                sx={{ maxWidth: "100px", textOverflow: "ellipsis", overflow: "hidden", border: "2px solid grey" }}
                onDelete={() => handleOnDelete()}
            />
        </Tooltip>
    );
}


export default ActiveSearchChip;
