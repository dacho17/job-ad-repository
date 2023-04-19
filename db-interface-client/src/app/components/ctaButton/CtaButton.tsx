import './CtaButton.css';

interface CtaButtonProps {
    label: string;
    isDisabled: boolean;
    actionFn: Function;
}

function Button(props : CtaButtonProps) {
  return (
    <button
      className="cta-button"
      type='button'
      disabled={props.isDisabled}
      onClick={() => props.actionFn()}>
      
        {props.label}
    </button>
  );
}

export default Button;
