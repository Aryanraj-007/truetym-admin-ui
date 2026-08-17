import { getHeaders } from '@/lib/api';
import { API_BASE_URL } from '@/lib/endpoint';

async function extractError(response: Response): Promise<string> {
  const errorText = await response.text();
  console.error('API Error Response:', errorText);
  try {
    const body = JSON.parse(errorText);
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }
  } catch {
    /* not JSON — use raw text below */
  }
  return errorText || `${response.status}: ${response.statusText}`;
}

// ===========================================================================
// Types
// ===========================================================================
export type TargetType = 'org' | 'user';

export interface CountRow {
  source: 'mysql' | 'mongo';
  name: string;
  level: number;
  count: number;
}

export interface PreviewResult {
  targetType: TargetType;
  id: string;
  displayName: string;
  userCount: number;
  totalRows: number;
  rows: CountRow[];
}

export interface DeleteStep {
  source: 'mysql' | 'mongo';
  name: string;
  level: number;
  deleted: number;
  status: 'ok' | 'error';
  error?: string;
}

export interface ExecuteRequest {
  targetType: TargetType;
  id: string;
  confirmationName: string;
  dryRun?: boolean;
}

export interface ExecuteResponse {
  displayName: string;
  steps: DeleteStep[];
  dryRun: boolean;
  totalDeleted: number;
  hadErrors: boolean;
}

export interface StreamHandlers {
  onStep: (step: DeleteStep) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

export interface PickItem {
  id: string;
  name: string;
  subtitle: string;
  isActive: boolean;
  statusLabel: string;
}

// ===========================================================================
// 0. SEARCH USERS — for the name-based picker (orgs reuse fetchOrganizations)
// ===========================================================================
export async function searchUsers(q: string): Promise<PickItem[]> {
  try {
    const url = `${API_BASE_URL}/admin/offboarding/search-users?q=${encodeURIComponent(q)}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders() });
    if (!response.ok) {
      throw new Error(await extractError(response));
    }
    return (await response.json()) as PickItem[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('searchUsers error:', errorMessage);
    throw new Error(`Failed to search users: ${errorMessage}`);
  }
}

// ===========================================================================
// 1. PREVIEW — counts only, no writes
// ===========================================================================
export async function getOffboardingPreview(
  targetType: TargetType,
  id: string,
): Promise<PreviewResult> {
  try {
    const url = `${API_BASE_URL}/admin/offboarding/preview`;
    console.log('Offboarding preview at:', url, { targetType, id });

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetType, id }),
    });

    if (!response.ok) {
      throw new Error(await extractError(response));
    }

    return (await response.json()) as PreviewResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('getOffboardingPreview error:', errorMessage);
    throw new Error(`Failed to load preview: ${errorMessage}`);
  }
}

// ===========================================================================
// 2. EXECUTE (atomic) — one transactional MySQL delete, then Mongo
// ===========================================================================
export async function executeOffboarding(payload: ExecuteRequest): Promise<ExecuteResponse> {
  try {
    const url = `${API_BASE_URL}/admin/offboarding/execute`;
    console.log('Offboarding execute at:', url, payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await extractError(response));
    }

    return (await response.json()) as ExecuteResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('executeOffboarding error:', errorMessage);
    throw new Error(`Failed to delete: ${errorMessage}`);
  }
}

// ===========================================================================
// 3. EXECUTE (streaming) — live "one-by-one" delete via SSE-over-fetch
//    Using fetch (not EventSource) so your auth headers are sent.
// ===========================================================================
export async function streamOffboarding(
  payload: Pick<ExecuteRequest, 'targetType' | 'id' | 'confirmationName'>,
  handlers: StreamHandlers,
): Promise<void> {
  try {
    const url =
      `${API_BASE_URL}/admin/offboarding/execute-stream` +
      `?targetType=${encodeURIComponent(payload.targetType)}` +
      `&id=${encodeURIComponent(payload.id)}` +
      `&confirmationName=${encodeURIComponent(payload.confirmationName)}`;
    console.log('Offboarding stream at:', url);

    const response = await fetch(url, { method: 'GET', headers: getHeaders() });
    if (!response.ok || !response.body) {
      throw new Error(await extractError(response));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // SSE frames are separated by a blank line; each has `event:` and `data:`.
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        let event = 'message';
        let dataLine = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
        }
        if (!dataLine) continue;

        const parsed = JSON.parse(dataLine);
        if (event === 'step') handlers.onStep(parsed as DeleteStep);
        else if (event === 'done') handlers.onDone?.();
        else if (event === 'error') handlers.onError?.(parsed?.message ?? 'Stream error');
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('streamOffboarding error:', errorMessage);
    handlers.onError?.(errorMessage);
    throw new Error(`Streaming delete failed: ${errorMessage}`);
  }
}
