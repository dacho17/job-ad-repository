import axios, { AxiosError, AxiosResponse } from "axios";

const responseBody = (response: AxiosResponse) => response.data;
axios.interceptors.response.use(response => {
    return response;
}, (err: AxiosError) => {
    let res = err.response;
    let status: number = res?.status!;
    let data: any = res?.data;

    switch(status) {
        case 400:
            if (data.errors) {
                console.log(data.errors);
            }

            console.log("400 error intercepted by Axios!");
            break;
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
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody)
}

const jobRepositoryAPI = {
    getJobs: (params: URLSearchParams) => requests.get('localhost:1700/get-jobs', params),
}

export default jobRepositoryAPI;
