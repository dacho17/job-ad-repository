import FormInput from "../../../interface/FormInput";
import './GenDropdown.css';

interface GenDropdownProps {
    listOfValueLabelPairs: [any, string][];
    dropdownHandles: FormInput
}

export default function GenDropdown(props: GenDropdownProps) {

    function onValueChange(event: { target: HTMLSelectElement }) {
        props.dropdownHandles.setStateFn((prevState: any) => {
            const intValue = parseInt(event.target.value);
            const isChosenValueValid = props.dropdownHandles.validationFn ? props.dropdownHandles.validationFn(intValue) : true;
            return {
                entered: isChosenValueValid ? intValue : prevState.entered,
                isValid: isChosenValueValid,
                touched: true
            }
        })
    }

    return <div className="gen-dropdown__container">
        <select 
            className="gen-dropdown"
            name={props.dropdownHandles.name}
            onChange={(event) => onValueChange(event)}>
                {props.listOfValueLabelPairs.map((pair, index) => {
                    return <option
                        className="gen-dropdown__option"
                        value={pair[0]}
                        key={index}>{pair[1]}
                    </option>
                })}            
        </select>
        {
            !props.dropdownHandles.isValid && props.dropdownHandles.touched
                &&  <div className="gen-form-input__error-msg">{props.dropdownHandles.errMsg}</div>
        }
    </div>
}
