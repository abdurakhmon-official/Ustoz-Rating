import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserOutput } from '@repo/contracts';

interface AuthState {
  user: UserOutput | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: UserOutput; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setEmailVerified: (state) => {
      if (state.user) state.user.emailVerified = true;
    },
  },
});

export const { setCredentials, logout, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
