import { useState } from "react";
import JobAdScrapingForm from "../../../dtos/JobAdScrapingForm";
import FormInput from "../../../interface/FormInput";
import { scrapeJobAds } from "../../services/slices/AdminRepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import GenCheckbox from "../genCheckbox/GenCheckbox";
import GenForm from "../genForm/GenForm";

export default function ScrapeJobAdsForm() {
    const { jobAdScrapingResponseMsg, isJobAdScrapingMsgError } = useAppSelector(state => state.adminDashboard)
    const dispatch = useAppDispatch();

    function sendTheForm() {
        setJobTitleState((prevState) => {
            return {
                entered: prevState.entered || "",   // no need to validate these, just setting the default value
                isValid: true,
                touched: true
            }
        });
        setLocationState((prevState) => {
            return {
                entered: prevState.entered || "",   // no need to validate these, just setting the default value
                isValid: true,
                touched: true
            }
        });
        setNofAdsState((prevState) => {
            return {
                entered: prevState.entered,
                isValid: validateNofAds(prevState.entered),
                touched: true
            }
        });

        if (!nOfAdsState.isValid) return;    // the only field which is validated

        const scrapeJobAdsForm = {
            jobTitle: jobTitleState.entered,
            location: locationState.entered,
            numberOfAds: parseInt(nOfAdsState.entered),
            workFromHome: workFromHome.checked
        } as JobAdScrapingForm

        dispatch(scrapeJobAds(scrapeJobAdsForm));
    }

    const validateJobTitle = (val: string): boolean => !!val && val.length > 0;
    function validateNofAds(val: string) {
        let isValid;
        if (!val) {
            isValid = false;
        } else {
            const numericVal = parseInt(val);
            isValid = !isNaN(numericVal) && numericVal > 0;
        }

        return isValid;
    }

    const [jobTitleState, setJobTitleState] = useState({
        entered: "",
        isValid: false,
        touched: false
    });
    const [locationState, setLocationState] = useState({
        entered: "",
        isValid: true,
        touched: false
    });
    const [nOfAdsState, setNofAdsState] = useState({
        entered: "",
        isValid: false,
        touched: false
    });
    const [workFromHome, setWorkFromHome] = useState({
        checked: false
    });

    const formInputs: FormInput[] = [
        {
            entered: jobTitleState.entered,
            isValid: jobTitleState.isValid,
            touched: jobTitleState.touched,
            setStateFn: setJobTitleState,
            name: 'job title',
            validationFn: validateJobTitle,
            errMsg: 'Job title field must contain at least one letter',

        },
        {
            entered: locationState.entered,
            isValid: locationState.isValid,
            touched: locationState.touched,
            setStateFn: setLocationState,
            name: 'location',
        },
        {
            entered: nOfAdsState.entered,
            isValid: nOfAdsState.isValid,
            touched: nOfAdsState.touched,
            setStateFn: setNofAdsState,
            name: 'ads to scrape',
            errMsg: 'The number must be greater than 0',
            validationFn: validateNofAds
        }
    ];

    const scrapeOnlyRemoteCheckbox = <GenCheckbox
        key="workFromHome"
        id="workFromHome"
        label="Scrape only remote"
        name="workFromHome"
        setValue={setWorkFromHome}
        value={workFromHome.checked}
    />

    let msgClassName = isJobAdScrapingMsgError
            ? 'gen-form-input__error-msg'
            : 'gen-form-input__success-msg'
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center"
        }}>
            <GenForm
                formTitle='Scrape Job Ads'
                buttonLabel="Scrape"
                listOfFormInputs={formInputs}
                onFormSubmitFn={sendTheForm}
                additionalElements={[scrapeOnlyRemoteCheckbox]}
                resMessageElement={jobAdScrapingResponseMsg ? <span className={msgClassName}>{jobAdScrapingResponseMsg}</span> : null}
            />
        </div>
    );
}
