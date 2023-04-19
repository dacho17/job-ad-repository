import './GenCheckbox.css';

interface GenCheckboxProps {
    label: string;
    name: string;
    id: string;
    setValue: Function;
    value: boolean
};

export default function GenCheckbox(props: GenCheckboxProps) {
    function switchValue() {
        props.setValue((prevState: any) => {
            return {
                checked: !prevState.checked
            }
        });
    }

    return (
        <div>
            <input
                name={props.name}
                id={props.id}
                type="checkbox"
                checked={props.value}
                onChange={() => switchValue()}/>
            <label className="gen-checkbox__label" htmlFor={props.id}>{props.label}</label>
        </div>
    );
}
