import './LoadingComponents.css';

interface LoadingComponentProps {
    message?: string;
}

export default function LoadingComponent({ message }:  LoadingComponentProps) {
    return (
            <div className="loading-component">
                <div className="loading-component__spinner"></div>
                <div>
                    {message}
                </div>
            </div>
    );
}
