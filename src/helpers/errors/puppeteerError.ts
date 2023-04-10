export default class PuppeteerError extends Error {
    private httpCode: number;

    constructor(msg: string, httpCode: number) {
        const error = super(msg);

        this.httpCode = httpCode;
    }

    public getMessage() {
        return this.message;
    }

    public getHttpCode() {
        return this.httpCode;
    }
}
