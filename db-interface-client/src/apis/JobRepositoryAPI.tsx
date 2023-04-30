import axios, { AxiosError, AxiosResponse } from "axios";
import AppResponse from "../dtos/AppResponse";
import Job from "../dtos/Job";
import JobAdScrapingForm from "../dtos/JobAdScrapingForm";
import { JobAdScrapingTask } from "../dtos/JobAdScrapingTask";
import { JobScrapingTask } from "../dtos/JobScrapingTask";
import User from "../dtos/User";

const appResponse = function<T>(response: AxiosResponse): AppResponse<T> {
    return {
        httpCode: response.status,
        body: response.data
    } as AppResponse<T>;
};
axios.interceptors.request.use(request => {
    request.headers['x-access-token'] = localStorage.getItem("userJwt");
    return request;
});
axios.interceptors.response.use(response => {
    return response;
}, (err: AxiosError) => {
    let res = err.response;
    let status: number = res?.status!;
    let data: any = res?.data;

    // console.log(`Axios error = ${JSON.stringify(err)}`);
    // console.log(`Error with code ${status}`);

    switch(status) {
        case 400:
            if (data.errors) {
                console.log(data.errors);
            }

            console.log("400 error intercepted by Axios!");
            break;
        case 401:
            console.log(`An authroization error intercepted by Axios! -[${data.errors}]`);
            break
        case 404:
            if (data.errors) {
                console.log(data.errors);
            }

            console.log("404 error intercepted by Axios!");
            break;
        case 500:
            if (data.errors) {
                console.log(data.errors);
            }

            console.log("500 error intercepted by Axios!");
            break;
        default:
            console.log(`${status} error intercepted by Axios!`);
            break;
    }

    return Promise.reject(err.response);
});

const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(appResponse),
    post: (url: string, body: {}) => axios.post(url, body).then(appResponse),
}

const BE_API_URL = process.env.BE_API_URL || 'http://localhost:1700';
const jobRepositoryAPI = {
    login: (values: User) => requests.post(`${BE_API_URL}/login`, values) as Promise<AppResponse<User | null>>,
    signup: (values: User) => requests.post(`${BE_API_URL}/register`, values) as Promise<AppResponse<User | null>>,
    signout: (values: User) => requests.post(`${BE_API_URL}/logout`, values) as Promise<AppResponse<User | null>>,

    getJobs: (params: URLSearchParams) => requests.get(`${BE_API_URL}/get-jobs`, params) as Promise<AppResponse<Job[] | null>>,
    getJob: (values: object) => requests.post(`${BE_API_URL}/get-job`, values) as Promise<AppResponse<Job | null>>,

    scrapeJobFromUrl: (values: object) => requests.post(`${BE_API_URL}/scrape-from-url`, values) as Promise<AppResponse<Job | null>>,
    scrapeAndParseJobFromUrl: (values: object) => requests.post(`${BE_API_URL}/parse-job`, values) as Promise<AppResponse<Job | null>>,

    scrapeJobAds: (values: JobAdScrapingForm) => requests.post(`${BE_API_URL}/scrape-job-ads`, values) as Promise<AppResponse<JobAdScrapingTask | null>>,
    scrapeJobs: () => requests.get(`${BE_API_URL}/scrape-jobs`) as Promise<AppResponse<JobScrapingTask | null>>,
    getJobAdScrapingTasks: (values: object) => requests.post(`${BE_API_URL}/get-job-ad-scraping-tasks`, values) as Promise<AppResponse<JobAdScrapingTask[] | null>>,
    getJobScrapingTasks: (values: object) => requests.post(`${BE_API_URL}/get-job-scraping-tasks`, values) as Promise<AppResponse<JobScrapingTask[] | null>>,
}

export default jobRepositoryAPI;
