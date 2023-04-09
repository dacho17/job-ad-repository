export default class ResponseObject<T> {
    constructor() {}

    data: T;
    error?: string;
}
