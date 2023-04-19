export default interface FormInput {
    name: string;
    validationFn?: Function;
    entered: string | number;
    isValid: boolean;
    touched: boolean;
    setStateFn: Function;
    errMsg?: string;
}
