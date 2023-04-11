export default class UniqueDataError extends Error {
    constructor(msg: string) {
        const error = super(msg);
    }

    public getMessage() {
        return this.message;
    }
}
