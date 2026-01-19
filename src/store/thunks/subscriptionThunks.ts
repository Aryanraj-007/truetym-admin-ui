import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  fetchPlanDetails,
  fetchSubscriptions,
  PlanDetailsResponse,
  Subscription,
  SubscriptionsResponse,
} from '@/lib/api';

// Create an async thunk for fetching subscriptions
export const fetchSubscriptionsData = createAsyncThunk<
  Subscription[],
  void,
  {
    rejectValue: string;
  }
>('subscription/fetchSubscriptions', async (_, thunkAPI) => {
  try {
    const response: SubscriptionsResponse = await fetchSubscriptions();

    if (!response.succeeded) {
      return thunkAPI.rejectWithValue(response.message?.[0] || 'Failed to fetch subscriptions');
    }

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchSubscriptionsData error:', errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Create an async thunk for fetching plan details
export const fetchPlanDetailsData = createAsyncThunk<
  PlanDetailsResponse['data'],
  string,
  {
    rejectValue: string;
  }
>('subscription/fetchPlanDetails', async (planId: string, thunkAPI) => {
  try {
    const response: PlanDetailsResponse = await fetchPlanDetails(planId);

    if (!response.succeeded) {
      return thunkAPI.rejectWithValue(response.message?.[0] || 'Failed to fetch plan details');
    }

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchPlanDetailsData error:', errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});
