import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Job from "../../../dtos/Job";
import { RootState } from "../store";
import jobRepositoryAPI from '../../../apis/JobRepositoryAPI';
import AppResponse from "../../../dtos/AppResponse";

const INIT_PAGE_MESSAGE = "Search the repository for jobs";
export const ROWS_PER_PAGE = 20;

interface SearchState {
    companyNameSearch: string;
    companyNameEntered: string;
    jobTitleSearch: string;
    jobTitleEntered: string;
    loading: boolean;
    jobs: Job[] | null;
    displayedJob: Job | null;
    displayedJobId: number | null;
    message: string | null;
    page: number;
    batchSize: number;
    errorMessage: string | null;
}

const initialState: SearchState = {
    companyNameSearch: "",
    companyNameEntered: "",
    jobTitleSearch: "",
    jobTitleEntered: "",
    loading: true,
    jobs: null,
    displayedJob: null,
    displayedJobId: null,
    message: INIT_PAGE_MESSAGE,
    page: 0,
    batchSize: ROWS_PER_PAGE,
    errorMessage: null,
}

function getAxiosParams(searchState: SearchState) {
    const params = new URLSearchParams();
    console.log(`setting parameters companyNameSearch=${searchState.companyNameSearch} jobTitleSearch=${searchState.jobTitleSearch}`);
    params.append('companyNameSearch', searchState.companyNameSearch);
    params.append('jobTitleSearch', searchState.jobTitleSearch);
    params.append('offset', (searchState.page * searchState.batchSize).toString());
    params.append('batchSize', searchState.batchSize.toString());
    
    return params;
}

export const fetchJobsAsync = createAsyncThunk<Job[], void, { state: RootState}>(
    "repository/fetchJobsAsync",
    async (_, thunkAPI) => {
        const params = getAxiosParams(thunkAPI.getState().repository);
        try {
            console.log(`params=${params.toString()}`);
            console.log(`In fetch JobAsync before the call`);
            const response: AppResponse<Job[] | null> = await jobRepositoryAPI.getJobs(params);
            
            const jobs = response.body.data;
            if (!jobs) {
                throw new Error(response.body.error);
            }
            return jobs;
        } catch (err: any) {
            console.log(`Error occurred - ${err}`);
            return thunkAPI.rejectWithValue(err.data.error);
        }
    }
);

export const fetchJobAsync = createAsyncThunk<Job, number, { state: RootState}>(
    "repository/fetchJobAsync",
    async (data, thunkAPI) => {
        try {
            console.log(`In fetch JobAsync before the call. Sending id=${data}`);
            const response: AppResponse<Job | null> = await jobRepositoryAPI.getJob({
                jobId: data
            });

            const job: Job | null = response.body.data;
            if (!job) throw new Error(response.body.error);

            return job;
        } catch (err: any) {
            console.log(`Error occurred - ${err}`);
            return thunkAPI.rejectWithValue({ error: err.data.error});
        }
    }
);

export const repositorySlice = createSlice({
    name: 'repository',
    initialState: initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload.isLoading;
        },
        setJobSearchParams: (state, action) => {
            state.jobTitleSearch = action.payload.jobTitle;
            state.companyNameSearch = action.payload.orgName;
            state.page = action.payload.pageNum;
        },
        setjobTitleSearched: (state, action) => {
            localStorage.setItem("jobTitleSearched", action.payload.searchedWord);
            state.jobTitleSearch = action.payload.searchedWord;
        },
        setcompanyNameSearched: (state, action) => {
            localStorage.setItem("companyNameSearched", action.payload.searchedWord);
            state.companyNameSearch = action.payload.searchedWord;
        },
        setjobTitleEntered: (state, action) => {
            state.jobTitleEntered = action.payload.enteredWord;
        },
        setCompanyNameEntered: (state, action) => {
            state.companyNameEntered = action.payload.enteredWord;
        },
        setPageNumber: (state, action) => {
            localStorage.setItem("jobsPageNumber", action.payload.pageNumber);
            state.page = action.payload.pageNumber;
        },
        setDisplayedJob: (state, action) => {
            const jobId = action.payload.job.id;
            localStorage.setItem("displayedJobId", jobId);
            state.displayedJobId = jobId;
            state.displayedJob = action.payload.job;
        },
        setDisplayedJobId: (state, action) => {
            const jobId = action.payload.jobId;
            localStorage.setItem("displayedJobId", jobId);
            console.log(`Setting state.displayedJobId to ${jobId}`)
            state.displayedJobId = jobId;
        },
        refreshDisplayedJob: (state) => {
            const displayedJobId = localStorage.getItem("displayedJobId");
            if (displayedJobId) {
                const displayedJobIdInt = parseInt(displayedJobId);
                if (!isNaN(displayedJobIdInt)) state.displayedJobId = displayedJobIdInt;
            }
        },
        refreshJobs: (state) => {
            const jobTitle = localStorage.getItem("jobTitleSearched");
            const companyName = localStorage.getItem("companyNameSearched");
            const jobPage = localStorage.getItem("jobsPageNumber");

            if (jobTitle) state.jobTitleSearch = jobTitle;
            if (companyName) state.companyNameSearch = companyName;
            if (jobPage) {
                const jobPageInt = parseInt(jobPage);
                if (!isNaN(jobPageInt)) state.page = jobPageInt;
            }
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchJobsAsync.pending, (state) => {
            state.errorMessage = null;
            state.loading = true;
        });
        builder.addCase(fetchJobAsync.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchJobsAsync.fulfilled, (state, action) => {
            state.errorMessage = null;
            state.jobs = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchJobAsync.fulfilled, (state, action) => {
            const jobId = action.payload.id as number;
            localStorage.setItem("displayedJobId", jobId.toString());

            state.displayedJob = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchJobsAsync.rejected, (state, action) => {
            console.log(`fetchJobsAsync rejected ${JSON.stringify(action.payload)}`);
            state.loading = false;
            state.errorMessage = "Data can not be displayed";
        });
        builder.addCase(fetchJobAsync.rejected, (state) => {
            state.loading = false;
        });
    })
});

export const { setjobTitleSearched, setLoading, setJobSearchParams, 
    setcompanyNameSearched, setjobTitleEntered, setCompanyNameEntered,
    setPageNumber, setDisplayedJob, setDisplayedJobId, refreshJobs, refreshDisplayedJob } = repositorySlice.actions;
