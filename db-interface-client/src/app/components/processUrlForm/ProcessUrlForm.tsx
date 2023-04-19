import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import Button from '../ctaButton/CtaButton';
import './ProcessUrlForm.css';

const urlValidationRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
function validateUrl(url: string) {
    return url !== null && url !==undefined && urlValidationRegex.test(url.trim())
}

interface ProcessUrlFormProps {
    onSubmitFunction: Function,
    submitButtonLabel: string
}

const INSERT_VALID_URL_MSG = "Please insert the valid url";
export default function ProcessUrlForm({ onSubmitFunction, submitButtonLabel }: ProcessUrlFormProps) {
    const dispatch = useAppDispatch();
    const { isUrlProcessingLoading } = useAppSelector(state => state.adminDashboard); 

    const [urlFieldState, setUrlFieldState] = useState({
        value: "",
        isValid: false,
        isTouched: false
    });

    function sendTheForm() {
        setUrlFieldState((prevState) => {
            return {
                value: prevState.value,
                isValid: validateUrl(prevState.value),
                isTouched: true
            }
        });

        if (!urlFieldState.isValid) return;

        dispatch(onSubmitFunction(urlFieldState.value));
    }

    return <form
        id="scrape-url-form">
        <input
            id="scrape-url-form__input"
            name="url"
            value={urlFieldState.value}
            placeholder={'Insert URL'}
            onChange={(event) => setUrlFieldState((prevState) => {
                const curVal = event.target.value;
                return {
                    value: curVal,
                    isValid: validateUrl(curVal),
                    isTouched: prevState.isTouched
                }
            })}
            onBlur={(event) => setUrlFieldState((prevState) => {
                const curVal = event.target.value;
                return {
                    value: curVal,
                    isValid: validateUrl(curVal),
                    isTouched: true
                }
            })}
        />
    <Button
        isDisabled={isUrlProcessingLoading}
        label={submitButtonLabel}
        actionFn={() => sendTheForm()}/>
        {!urlFieldState.isValid && urlFieldState.isTouched
            && <span className="scrape-url-form__invalid-input-msg">
                {INSERT_VALID_URL_MSG}
            </span>
        }
    </form>
}
