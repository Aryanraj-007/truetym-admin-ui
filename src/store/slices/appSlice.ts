import { fetchPlanDetailsData, fetchSubscriptionsData } from '@/store/thunks/subscriptionThunks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PlanDetailsResponse, Subscription } from '@/types/subscription';

type PlanDetails = PlanDetailsResponse['data'];

interface AppState {
  isSidebarOpen: boolean;
  subscriptions: {
    data: Subscription[];
    loading: boolean;
    error: string | null;
  };
  planDetails: {
    data: PlanDetails | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: AppState = {
  isSidebarOpen: true,
  subscriptions: {
    data: [],
    loading: false,
    error: null,
  },
  planDetails: {
    data: null,
    loading: false,
    error: null,
  },
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionsData.pending, (state) => {
        state.subscriptions.loading = true;
        state.subscriptions.error = null;
      })
      .addCase(fetchSubscriptionsData.fulfilled, (state, action: PayloadAction<Subscription[]>) => {
        state.subscriptions.loading = false;
        state.subscriptions.data = action.payload;
        state.subscriptions.error = null;
      })
      .addCase(fetchSubscriptionsData.rejected, (state, action) => {
        state.subscriptions.loading = false;
        state.subscriptions.error = action.payload || 'Failed to fetch subscriptions';
      })
      .addCase(fetchPlanDetailsData.pending, (state) => {
        state.planDetails.loading = true;
        state.planDetails.error = null;
      })
      .addCase(fetchPlanDetailsData.fulfilled, (state, action: PayloadAction<PlanDetails>) => {
        state.planDetails.loading = false;
        state.planDetails.data = action.payload;
        state.planDetails.error = null;
      })
      .addCase(fetchPlanDetailsData.rejected, (state, action) => {
        state.planDetails.loading = false;
        state.planDetails.error = action.payload || 'Failed to fetch plan details';
      });
  },
});

export const { toggleSidebar } = appSlice.actions;
export default appSlice.reducer;
