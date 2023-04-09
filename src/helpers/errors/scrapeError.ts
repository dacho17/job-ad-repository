export default class ScrapeError extends Error {
    constructor(msg: string) {
        const error = super(msg);
    }

    public getMessage() {
        return this.message;
    }
}
