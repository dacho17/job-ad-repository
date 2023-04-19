import { useAppDispatch } from "../../../services/store";
import '../SearchRow.css';
import './SearchField.css';

interface SearchFieldProps {
    placeholder: string;
    onChangeFn: Function;
}

export default function SearchField(props: SearchFieldProps) {
    const dispatch = useAppDispatch();
    
    function handleChange(event: { target: HTMLInputElement | HTMLTextAreaElement}) {
        dispatch(props.onChangeFn({
            enteredWord: event.target.value
        }));
    }

    return (
        <div className="search-field">
            <input
                className="search-field__input"
                placeholder={props.placeholder} 
                onChange={(event) => handleChange(event)}
            />
        </div>
    );
}
