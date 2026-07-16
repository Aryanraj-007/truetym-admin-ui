import axios, { AxiosError, AxiosInstance } from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRUETYM_ADMIN_URL || 'https://hrms-dev-admin-backend.truetym.com';

// ---- Response envelope shared by every /identity endpoint ----
export interface ApiEnvelope<T = any> {
  message: string[];
  succeeded: boolean;
  data: T;
}

// Get authentication token from localStorage or env
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    // Running on server, can't access localStorage
    return null;
  }
  // Try to get token from localStorage first
  const localToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }

  const envToken = process.env.NEXT_PUBLIC_TEMP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_AUTH_TOKEN;
  if (envToken) {
    console.warn('Using fallback token from environment');
    return envToken;
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('authToken', token);
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
  } catch {
    // ignore
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found');
  }
  return config;
});

export function toFailedEnvelope(error: unknown, fallbackMessage: string): ApiEnvelope {
  const axiosError = error as AxiosError<ApiEnvelope>;
  console.error(fallbackMessage, axiosError?.message);

  // If the server responded with a body in the envelope shape even on a
  // non-2xx status, prefer that over the generic fallback message.
  const responseBody = axiosError?.response?.data;
  if (responseBody && typeof responseBody === 'object' && 'succeeded' in responseBody) {
    return responseBody;
  }

  return { message: [fallbackMessage], succeeded: false, data: {} };
}
