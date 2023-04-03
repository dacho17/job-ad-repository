import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Job from "../../../dtos/Job";
import { RootState } from "../store";
import jobRepositoryAPI from '../../../apis/JobRepositoryAPI';

const INIT_PAGE_MESSAGE = "Search the repository for jobs";
export const ROWS_PER_PAGE = 20;

interface SearchState {
    searchedWord: string;
    enteredWord: string;
    loading: boolean;
    jobs: Job[] | null;
    message: string | null;
    page: number;
    totalEntries: number;
}

const initialState: SearchState = {
    searchedWord: "",
    enteredWord: "",
    loading: false,
    jobs: null,
    message: INIT_PAGE_MESSAGE,
    page: 0,
    totalEntries: 0,
}

function getAxiosParams(searchState: SearchState) {
    const params = new URLSearchParams();
    params.append("searchWord", searchState.searchedWord);
    params.append("offset", (searchState.page * ROWS_PER_PAGE).toString());
    
    return params;
}

export const fetchJobsAsync = createAsyncThunk<Job[], void, { state: RootState}>(
    "repository/fetchJobsAsync",
    async (_, thunkAPI) => {
        console.log('About to send the request');
        const params = getAxiosParams(thunkAPI.getState().repository);
        try {
            const response = await jobRepositoryAPI.getJobs(params);  // { job[], total, time }

            thunkAPI.dispatch(setTotalEntries(response.total));

            const jobs: Job[] = response.jobs;    // objects[] {"package", "score", "searchScore"}
            return jobs;    // NOTE: this value is available in payload of extraReducers
        } catch (err: any) {
            console.log(`Error occurred - ${err}`);
            return thunkAPI.rejectWithValue({ error: err.data});
        }
    }
);

export const repositorySlice = createSlice({
    name: 'repository',
    initialState: initialState,
    reducers: {
        setSearchWord: (state, action) => {
            state.searchedWord = action.payload;
        },
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
        setEnteredWord: (state, action) => {
            state.enteredWord = action.payload;
        },
        setTotalEntries: (state, action) => {
            state.totalEntries = action.payload;
        },
        setPageNumber: (state, action) => {
            state.page = action.payload;
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchJobsAsync.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchJobsAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = action.payload;
        });
        builder.addCase(fetchJobsAsync.rejected, (state) => {
            state.loading = false;
        });
    })
});

export const { setJobs, setSearchWord, setEnteredWord, setTotalEntries, setPageNumber } = repositorySlice.actions;
