import GenChip from "../../genChip/GenChip";
import '../SearchRow.css';


function ActiveSearchChip(props: any) { // setSearchedWord and searchedWord
    return (
            <GenChip
                label={props.searchedWord}
                onClick={() => props.setSearchedWord()}
            />
    );
}

export default ActiveSearchChip;
