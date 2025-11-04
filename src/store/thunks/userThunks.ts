import { createAsyncThunk } from '@reduxjs/toolkit';

import { User } from '@/types/user';

// Create an async thunk for fetching user data
export const fetchUser = createAsyncThunk<User, number>(
  'user/fetchUser',
  async (userId: number, thunkAPI) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data: User = await response.json();
      return data;
    } catch (error) {
      console.log('error', error);

      return thunkAPI.rejectWithValue('Failed to fetch user');
    }
  },
);

export const fetchUsers = createAsyncThunk<User[], void>('user/fetchUsers', async (_, thunkAPI) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.log('error', error);
    return thunkAPI.rejectWithValue('Failed to fetch users');
  }
});
