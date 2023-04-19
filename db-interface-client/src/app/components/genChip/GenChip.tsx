import './GenChip.css';

interface GenChipProps {
    label: string;
    onClick: Function;
}

export default function GenChip(props: GenChipProps) {

    return <div className="gen-chip" onClick={() => props.onClick()}>
        <label className="gen-chip__label" htmlFor={props.label}>{props.label}</label>
        <button
            id={props.label}
            className="gen-chip__close"
            type="button"
        >
        -
        </button>
    </div>
}
