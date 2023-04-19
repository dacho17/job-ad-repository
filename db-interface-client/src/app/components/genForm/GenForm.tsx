import FormInput from "../../../interface/FormInput";
import Button from "../ctaButton/CtaButton";
import GenFormInput from "../genFormInput/GenFormInput";
import './GenForm.css';

interface GenFormProps {
    formTitle: string;
    buttonLabel: string;
    listOfFormInputs: FormInput[];
    onFormSubmitFn: Function;
    loginSignupElement?: JSX.Element;
    additionalElements?: JSX.Element[];
    resMessageElement: JSX.Element | null;
}

export default function GenForm({ onFormSubmitFn, formTitle, buttonLabel, listOfFormInputs, loginSignupElement, additionalElements, resMessageElement }: GenFormProps) {
    return <div className="gen-form__container">
        <span className="gen-form__title">{formTitle}</span>
        <form className="gen-form">
            {listOfFormInputs.map((formInput, index) => {
                return <GenFormInput 
                    key={index}
                    {...formInput}
                />
            })}
        <div className="margin-bottom-2" />
        {additionalElements && <>
            {additionalElements.map(el => el)}
            <div className="margin-bottom-2" />
        </>}
        {loginSignupElement && <>
            {loginSignupElement}
            <div className="margin-bottom-2" />
        </> }
        <Button
            label={buttonLabel}
            isDisabled={false}
            actionFn={() => onFormSubmitFn()}
        />
        </form>
        <div className="margin-bottom-2" />
        {resMessageElement}
    </div>
}
