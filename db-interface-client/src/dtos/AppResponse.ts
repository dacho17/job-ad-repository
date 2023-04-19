import { JobRepositoryResponse } from "./JobRepositoryResponse";

export default interface AppResponse<T> {
    httpCode: number;
    body: JobRepositoryResponse<T>
}
