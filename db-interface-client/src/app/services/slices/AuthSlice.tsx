import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import agent from "../../../apis/JobRepositoryAPI";
import AppResponse from "../../../dtos/AppResponse";
import User from "../../../dtos/User";

interface AuthState {
    user: User | null;
    authErrorMsg: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    authErrorMsg: null,
    isLoading: true,
}

export const logIn = createAsyncThunk<User | null, User>(
    "auth/logIn",
    async (data, thunkAPI) => {
        try {
            const res: AppResponse<User | null> = await agent.login(data);
            if (res.httpCode === 401) {
                thunkAPI.dispatch(signoutUser());
                throw Error(res.body.error);
            }
            if (res.body.data) {
                thunkAPI.dispatch(loginUser(res.body.data));
                return res.body.data!;
            }
            throw new Error(res.body.error);
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            const authErrorMsg = err.data.error;
            return thunkAPI.rejectWithValue(authErrorMsg);
        }
    }
);

export const signUp = createAsyncThunk<User | null, User>(
    "auth/signUp",
    async (data, thunkAPI) => {
        try {
            const res: AppResponse<User | null> = await agent.signup(data);
            if (res.body.data) {
                thunkAPI.dispatch(loginUser(res.body.data));
                return res.body.data!;
            }
            throw new Error(res.body.error);
        } catch (err: any) {
            if (err.status === 401) {
                thunkAPI.dispatch(signoutUser());
            }
            const authErrorMsg = err.data.error;

            return thunkAPI.rejectWithValue(authErrorMsg);
        }
    }
);

export const signOut = createAsyncThunk<User | null, User>(
    "auth/signOut",
    async (data, thunkAPI) => {
        try {
            const res: AppResponse<User | null> = await agent.signout(data);
            console.log(`Data returned = ${JSON.stringify(res.body.data)}`)
            thunkAPI.dispatch(signoutUser());
            if (res.body.data) {
                return res.body.data!;
            }
            throw new Error(res.body.error);
        } catch (err: any) {
            thunkAPI.dispatch(signoutUser());
            console.log(`in error handling of signOut - [${JSON.stringify(err)}]`);
            const authErrorMsg = err.data.error;
            return thunkAPI.rejectWithValue(authErrorMsg);
        }
    }
);

export const authSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        signoutUser: (state) => {
            localStorage.removeItem("username");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userJwt");
            
            state.user = null;
        },
        loginUser: (state, action) => {
            const { username, role, jwt } = action.payload;
            localStorage.setItem("username", username);
            localStorage.setItem("userRole", role);
            localStorage.setItem("userJwt", jwt);

            state.user = {...action.payload};
        },
        refreshUserLogin: (state) => {
            state.isLoading = true;
            const username = localStorage.getItem("username");
            const userRole = localStorage.getItem("userRole");
            const userJwt = localStorage.getItem("userJwt");
            
            if (username && userRole && userJwt) {
                state.user = {
                    username: username,
                    role: parseInt(userRole),
                    jwt: userJwt,
                };
            }
            state.isLoading = false;
        }
    },
    extraReducers: (builder => {
        builder.addMatcher(isAnyOf(signUp.rejected, logIn.rejected), (state, action) => {
            state.user = null;
            state.authErrorMsg = action.payload as string;
            state.isLoading = false;
        });
    })
});

export const { signoutUser, loginUser, refreshUserLogin } = authSlice.actions;
