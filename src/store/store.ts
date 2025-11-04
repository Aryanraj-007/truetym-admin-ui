import appReducer from '@/store/slices/appSlice';
import counterReducer from '@/store/slices/counterSlice';
import userReducer from '@/store/slices/userSlice';
import { configureStore } from '@reduxjs/toolkit';

export const makeStore = () =>
  configureStore({
    reducer: {
      counter: counterReducer,
      user: userReducer,
      app: appReducer,
    },
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
