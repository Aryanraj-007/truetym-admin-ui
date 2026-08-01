import { apiClient, ApiEnvelope, setAuthToken, toFailedEnvelope } from '@/lib/api-client';

// ---------------------------------------------------------------
// Identity endpoints
// ---------------------------------------------------------------

export async function sendOtp(payload: {
  phoneNumber: number;
  dialCode: string;
}): Promise<ApiEnvelope> {
  try {
    const res = await apiClient.post<ApiEnvelope>('/identity/send-otp', payload);
    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to send OTP. Please try again.');
  }
}

export async function verifyOtp(payload: { otp: string; userId: string }): Promise<ApiEnvelope> {
  try {
    const res = await apiClient.post<ApiEnvelope>('/identity/verify-otp', payload);

    // Capture the REAL token the moment it comes back — this is what
    // overrides any temp/env fallback token from here on.
    if (res.data?.succeeded === true && res.data?.data?.accessToken) {
      setAuthToken(res.data.data.accessToken);
    }

    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to verify OTP. Please try again.');
  }
}

export async function signUp(payload: {
  name: string;
  dialCode: string;
  phoneNumber: string;
  email: string;
  password: string;
}): Promise<ApiEnvelope> {
  try {
    const res = await apiClient.post<ApiEnvelope>('/identity/signup', payload);
    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to sign up right now. Please try again.');
  }
}

export async function loginWithPassword(payload: {
  dialCode: string;
  phoneNumber: string;
  password: string;
}): Promise<ApiEnvelope> {
  try {
    const res = await apiClient.post<ApiEnvelope>('/identity/login', payload);

    // Same rule as verifyOtp — the backend-issued token wins from here on.
    if (res.data?.succeeded === true && res.data?.data?.accessToken) {
      setAuthToken(res.data.data.accessToken);
    }

    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to log in right now. Please try again.');
  }
}

export async function assignRole(payload: { userId: string; role: string }): Promise<ApiEnvelope> {
  try {
    // requires a real session token (super_admin/admin) — attached
    // automatically by the request interceptor above
    const res = await apiClient.post<ApiEnvelope>('/identity/assign-role', payload);
    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to assign role. Please try again.');
  }
}

export async function getPendingSignups(): Promise<ApiEnvelope> {
  try {
    const res = await apiClient.get<ApiEnvelope>('/identity/pending-signups');
    return res.data;
  } catch (error) {
    return toFailedEnvelope(error, 'Unable to load pending signups.');
  }
}
