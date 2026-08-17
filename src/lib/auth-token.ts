import { AdminRole } from '@/constants/admin-role';

const TOKEN_KEY = 'authToken';

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const base64Payload = token.split('.')[1];
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUserRole(): AdminRole | null {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeJwtPayload<{ role: AdminRole | null }>(token);
  return payload?.role ?? null;
}
