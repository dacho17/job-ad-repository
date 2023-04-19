import { useRef } from 'react';
import FormInput from '../../../interface/FormInput';
import './GenFormInput.css';

function GenFormInput(props: FormInput) {
    const inputRef = useRef<HTMLInputElement>(null);

    function onInputChanged(event: { target: HTMLInputElement; }, didBlur: boolean) {
        props.setStateFn((prevState: any) => {
            return {
                entered: event.target.value,
                isValid: props.validationFn ? props.validationFn(event.target.value) : true,
                touched: prevState.touched || didBlur
            }
        });
    }

    return (
        <div className="gen-form-input">
            <div className="gen-form-input__container">
                <input
                    className="gen-form-input__value"
                    name={props.name}
                    value={props.entered}
                    ref={inputRef}
                    onChange={(event) => onInputChanged(event, false)}
                    onBlur={(event) => onInputChanged(event, true)} />
                <label 
                    className="gen-form-input__placeholder"
                    htmlFor={props.name}
                    onClick={() => inputRef.current!.focus()}
                    >
                        {props.name}</label>
            </div>
            {
                !props.isValid && props.touched &&
                    <span className="gen-form-input__error-msg">{props.errMsg}</span>
            }
        </div>
    );
}

export default GenFormInput;
