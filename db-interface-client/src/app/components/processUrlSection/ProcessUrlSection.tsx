import { useAppSelector } from "../../services/store";
import LoadingComponent from "../loadingComponent/LoadingComponent";
import ProcessUrlForm from "../processUrlForm/ProcessUrlForm";
import './ProcessUrlSection.css';

interface ProcessUrlSectionProps {
    onUrlSubmitFuntion: Function;
    buttonLabel: string;
}

export default function ProcessUrlSection({onUrlSubmitFuntion, buttonLabel}: ProcessUrlSectionProps) {
    const { processedJob, isUrlProcessingLoading } = useAppSelector(state => state.adminDashboard);

    return (
        <div className="process-url-section">
            <ProcessUrlForm onSubmitFunction={onUrlSubmitFuntion} submitButtonLabel={buttonLabel} />
            <div 
                className="process-url-section__job-display"
                style={{backgroundColor: !processedJob ? "grey" : "whitesmoke"}}
            >
                {isUrlProcessingLoading && <LoadingComponent message="Url is being processed" />}
                {processedJob ? JSON.stringify(processedJob) : ""}
                {/* NOTE: this can be formatted nicely */}
            </div>
        </div>
    );
}
