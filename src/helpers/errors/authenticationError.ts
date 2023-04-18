export default class AuthenticationError extends Error {
    constructor(msg: string) {
        const error = super(msg);
    }

    public getMessage() {
        return this.message;
    }
}
