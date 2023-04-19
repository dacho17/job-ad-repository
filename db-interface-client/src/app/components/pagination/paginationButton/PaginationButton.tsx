import './PaginationButton.css';

interface PaginationButtonProps {
    onClickFn: Function;
    pageNumber: number;
    isDisabled: boolean;
}

export default function PaginationButton(props: PaginationButtonProps) {


    return (
        <button
            className="pagination-row__button"
            type="button"
            disabled={props.isDisabled}
            onClick={() => props.onClickFn()}
        >
            {props.pageNumber}
        </button>
    );
}

