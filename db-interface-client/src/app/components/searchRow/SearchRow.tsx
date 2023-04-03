// https://dev.to/salehmubashar/search-bar-in-react-js-545l - this article might help
import { Box } from "@mui/material";
import { useAppSelector } from "../../services/store";
import ActiveSearchChip from "./activeSearchChip/ActiveSearchChip";
import SearchButton from "./searchButton/SearchButton";
import SearchField from "./searchField/SearchField";
import './SearchRow.css';


function SearchRow() {
    const { searchedWord } = useAppSelector(state => state.repository);
    
    return (
        <Box className="search-row">
            <SearchField />
            <SearchButton />
            {searchedWord !== "" && <ActiveSearchChip />}
        </Box>
    );
}

export default SearchRow;
