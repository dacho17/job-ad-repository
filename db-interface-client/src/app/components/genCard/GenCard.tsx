import './GenCard.css';

interface GenCardProps {
    message: string;
}

export default function GenCard({message}: GenCardProps) {

    return (
        <div className="gen-card">
            <span>{message}</span>
        </div>
    );
}
