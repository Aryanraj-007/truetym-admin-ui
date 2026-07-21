import { API_BASE_URL } from '@/lib/endpoint';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ExtendPayload {
  days?: number;
  newDate?: number; // epoch seconds (overrides days)
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.succeeded) {
    throw new Error(json.message?.join(', ') || 'Request failed');
  }
  return json as T;
}

export const updateSubscriptionMode = (id: string, mode: 'auto' | 'manual') =>
  patchJson(`/organisations/${id}/subscription-mode`, {
    subscription_mode: mode,
  });

export const extendTrial = (id: string, payload: ExtendPayload) =>
  patchJson(`/organisations/${id}/extend-trial`, payload);

export const extendSubscription = (id: string, payload: ExtendPayload) =>
  patchJson(`/organisations/${id}/extend-subscription`, payload);
