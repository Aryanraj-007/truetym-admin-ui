import appReducer from '@/store/slices/appSlice';
import authReducer from '@/store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
