// ─── typed selectors ─────────────────────────────────────────────────────────

import { AdminRole } from '@/constants/admin-role';
import { RootState } from '@/store/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  accessToken: string;
}

interface AuthState {
  user: AuthUser | null;
  /** true while the app is rehydrating from sessionStorage on first mount */
  rehydrated: boolean;
}

const SESSION_KEY = 'truetym_admin_auth';

// ─── helpers ────────────────────────────────────────────────────────────────

function loadFromSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveToSession(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* storage quota / private-mode — silent */
  }
}

// ─── slice ───────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null, // populated by rehydrateAuth on app boot
  rehydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Called once at app startup (in StoreProvider or a top-level useEffect)
     * to restore the session from sessionStorage.
     */
    rehydrateAuth(state) {
      state.user = loadFromSession();
      state.rehydrated = true;
    },

    /**
     * Called in LoginPage after a successful login response, before redirect.
     * Pass the fields you get back from loginWithPassword / verifyOtp.
     */
    setAuthUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      saveToSession(action.payload);
    },

    /**
     * Called on logout — clears Redux + sessionStorage.
     */
    clearAuthUser(state) {
      state.user = null;
      saveToSession(null);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    },
  },
});

export const { rehydrateAuth, setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsSuperAdmin = (state: RootState) =>
  state.auth.user?.role === AdminRole.SUPER_ADMIN;
