import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { adminRepositorySlice } from "./slices/AdminRepositorySlice";
import { authSlice } from "./slices/AuthSlice";
import { repositorySlice } from "./slices/RepositorySlice";


export const store = configureStore({
    reducer: {
        repository: repositorySlice.reducer,
        adminDashboard: adminRepositorySlice.reducer,
        auth: authSlice.reducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;  // helper type
export type AppDispatch = typeof store.dispatch;            // helper type

export const useAppDispatch = () => useDispatch<AppDispatch>();                 // overriding default useDispatch function
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;     // overriding default useAppSelector function
