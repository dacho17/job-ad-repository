export default class UnrecognizedDataError extends Error {
    constructor(msg: string) {
        const error = super(msg);
    }

    public getMessage() {
        return this.message;
    }
}
