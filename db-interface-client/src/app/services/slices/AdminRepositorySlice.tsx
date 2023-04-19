import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import jobRepositoryAPI from "../../../apis/JobRepositoryAPI";
import AppResponse from "../../../dtos/AppResponse";
import Job from "../../../dtos/Job";
import JobAdScrapingForm from "../../../dtos/JobAdScrapingForm";
import { JobAdScrapingTask } from "../../../dtos/JobAdScrapingTask";
import { JobScrapingTask } from "../../../dtos/JobScrapingTask";
import Constants from "../../assets/constants";
import { RootState } from "../store";
import { signoutUser } from './AuthSlice';

interface AdminDahsboard {
    jobAdScrapingResponseMsg: string | null;
    isJobAdScrapingMsgError: boolean | null;
    activeTab: number;
    jobTaskOffset: number;
    areTasksLoading: boolean;
    isUrlProcessingLoading: boolean;
    jobAdScrapingTasks: JobAdScrapingTask[];
    jobScrapingTasks: JobScrapingTask[];
    processedJob: Job | null;
}

const initialState: AdminDahsboard = {
    jobAdScrapingResponseMsg: null,
    isJobAdScrapingMsgError: null,
    activeTab: 0,
    jobTaskOffset: 0,
    areTasksLoading: false,
    isUrlProcessingLoading: false,
    jobAdScrapingTasks: [],
    jobScrapingTasks: [],
    processedJob: null
}

export const scrapeJobAds = createAsyncThunk<JobAdScrapingTask | null, JobAdScrapingForm, { state: RootState }>(
    "adminRepository/scrapeJobAds",
    async (jobAdScrapingForm, thunkAPI) => {
        try {
            const response: AppResponse<JobAdScrapingTask | null> = await jobRepositoryAPI.scrapeJobAds(jobAdScrapingForm);

            console.log(`response received = ${response.body.data}`)

            if (response.body.data) {
                thunkAPI.dispatch(setJobAdScrapingResponseMsg({
                    resMsg: 'Task started successfully',
                    isErrorMsg: false
                }));
                thunkAPI.dispatch(addJobAdScrapingTask({
                    newTask: response.body.data
                }));
            }

            
            return response.body.data;
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }

            console.log(`stringified error = ${JSON.stringify(err)}`);
            console.log(`Error occurred - ${err}`);
            thunkAPI.dispatch(setJobAdScrapingResponseMsg({
                resMsg: err.data.error || err,
                isErrorMsg: true
            }));


            console.log(err.data.error)
            console.log(`stringified error = ${JSON.stringify(err.data.error)}`);
            return thunkAPI.rejectWithValue(err.data.error);
        }
    }
);

export const scrapeJobs = createAsyncThunk<JobScrapingTask | null, void, { state: RootState}>(
    "adminRepository/scrapeJobs",
    async (_, thunkAPI) => {
        try {
            const response = await jobRepositoryAPI.scrapeJobs();

            if (response.body.data) {
                thunkAPI.dispatch(setJobAdScrapingResponseMsg({
                    resMsg: 'Task started successfully',
                    isErrorMsg: false
                }));
                thunkAPI.dispatch(addJobScrapingTask({
                    newTask: response.body.data
                }));
            }
            
            return response.body.data;
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }

            console.log(`Error occurred - ${err}`);
            thunkAPI.dispatch(setJobAdScrapingResponseMsg({
                resMsg: err.data.error || err,
                isErrorMsg: false
            }));

            return thunkAPI.rejectWithValue({ error: err.data.error});
        }
    }
);

export const getJobAdScrapingTasks = createAsyncThunk<string, number, { state: RootState}>(
    "adminRepository/getJobAdScrapingTasks",
    async (offset, thunkAPI) => {
        try {
            thunkAPI.dispatch(setOffset({
                offset: offset
            }));
            const response = await jobRepositoryAPI.getJobAdScrapingTasks({
                offset: offset
            });

            console.log(JSON.stringify(response.body));

            thunkAPI.dispatch(setJobAdScrapingTasks({
                jobAdScrapingTasks: response.body.data
            }));

            // check the response
            
            return 'success';
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            console.log(`Error occurred - ${err}`);
            return thunkAPI.rejectWithValue({ error: err.data.error});
        }
    }
);

export const getJobScrapingTasks = createAsyncThunk<string, number, { state: RootState}>(
    "adminRepository/getJobScrapingTasks",
    async (offset, thunkAPI) => {
        try {
            const response = await jobRepositoryAPI.getJobScrapingTasks({
                offset: offset
            });

            console.log(JSON.stringify(response.body));

            thunkAPI.dispatch(setJobScrapingTasks({
                jobScrapingTasks: response.body.data
            }));

            // check the response
            
            return 'success';
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            console.log(`Error occurred - ${err}`);
            return thunkAPI.rejectWithValue({ error: err.data.error});
        }
    }
);

export const scrapeJobURL = createAsyncThunk<string, string, { state: RootState}>(
    "adminRepository/scrapeJobURL",
    async (urlToScrape, thunkAPI) => {
        try {
            const response = await jobRepositoryAPI.scrapeJobFromUrl({
                url: urlToScrape
            });

            thunkAPI.dispatch(setProcessedJob({
                processedJob: response.body.data
            }));

            return 'success';
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            console.log(`An error occurred -[${err}]`);
            return thunkAPI.rejectWithValue({ error: err.data.error });
        }
    }
);

export const scrapeAndParseJobURL = createAsyncThunk<string, string, { state: RootState}>(
    "adminRepository/scrapeJobURL",
    async (urlToScrape, thunkAPI) => {
        try {
            const response = await jobRepositoryAPI.scrapeAndParseJobFromUrl({
                url: urlToScrape
            });

            thunkAPI.dispatch(setProcessedJob({
                processedJob: response.body.data
            }));

            return 'success';
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            console.log(`An error occurred -[${err}]`);
            return thunkAPI.rejectWithValue({ error: err.data.error });
        }
    }
);

export const adminRepositorySlice = createSlice({
    name: 'adminRepository',
    initialState: initialState,
    reducers: {
        setJobAdScrapingResponseMsg: (state, action) => {
            state.jobAdScrapingResponseMsg = action.payload.resMsg;
            state.isJobAdScrapingMsgError = action.payload.isErrorMsg;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload.activeTab;
            state.isJobAdScrapingMsgError = null;
            state.jobAdScrapingResponseMsg = null;
            state.jobTaskOffset = 0;
            state.jobAdScrapingTasks = [];
            state.jobScrapingTasks = [];
            state.processedJob = null;
        },
        changeOffset: (state, action) => {
            state.isJobAdScrapingMsgError = null;
            state.jobAdScrapingResponseMsg = null;
            state.jobTaskOffset = state.jobTaskOffset + action.payload.increment;
        },
        setOffset: (state, action) => {
            state.isJobAdScrapingMsgError = null;
            state.jobAdScrapingResponseMsg = null;
            state.jobTaskOffset = action.payload.offset;
        },
        addJobAdScrapingTask: (state, action) => {
            console.log(`incoming task has values ${JSON.stringify(action.payload)}`)
            if (state.jobAdScrapingTasks.length < Constants.TASK_TABLE_BATCH_SIZE) {
                let currentScrapingTasks = Array.from(state.jobAdScrapingTasks);
                currentScrapingTasks.push(action.payload.newTask);
                state.jobAdScrapingTasks = currentScrapingTasks;
            }
        },
        addJobScrapingTask: (state, action) => {
            if (state.jobScrapingTasks.length < Constants.TASK_TABLE_BATCH_SIZE) {
                state.jobScrapingTasks.push(action.payload.newTask);
            }
        },
        setJobAdScrapingTasks: (state, action) => {
            state.jobAdScrapingTasks = action.payload.jobAdScrapingTasks;
        },
        setJobScrapingTasks: (state, action) => {
            state.jobScrapingTasks = action.payload.jobScrapingTasks;
        },
        setProcessedJob: (state, action) => {
            state.processedJob = action.payload.processedJob;
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(isAnyOf(
            scrapeAndParseJobURL.pending, scrapeAndParseJobURL.pending), (state, action) => {
            state.isUrlProcessingLoading = true;
        });
        builder.addMatcher(isAnyOf(
            scrapeAndParseJobURL.fulfilled, scrapeAndParseJobURL.fulfilled), (state, action) => {
            state.isUrlProcessingLoading = false;
        });
        builder.addMatcher(isAnyOf(
            scrapeAndParseJobURL.rejected, scrapeAndParseJobURL.rejected), (state, action) => {
            state.isUrlProcessingLoading = false;
        });
        builder.addMatcher(isAnyOf(
            getJobAdScrapingTasks.pending, getJobScrapingTasks.pending), (state, action) => {
            state.areTasksLoading = true;
        });
        builder.addMatcher(isAnyOf(
            getJobAdScrapingTasks.fulfilled, getJobScrapingTasks.fulfilled), (state, action) => {
            state.areTasksLoading = false;
        });
        builder.addMatcher(isAnyOf(
            getJobAdScrapingTasks.rejected, getJobScrapingTasks.rejected), (state, action) => {
            state.areTasksLoading = false;
        });
    }
});

export const { setJobAdScrapingResponseMsg, setActiveTab, changeOffset, setOffset,
    setJobAdScrapingTasks, setJobScrapingTasks, setProcessedJob,
    addJobScrapingTask, addJobAdScrapingTask
} = adminRepositorySlice.actions;
