// API Debugging utilities
export function logApiCall(method: string, url: string, headers?: HeadersInit): void {
  console.group(`🔗 API Call: ${method} ${url}`);
  console.log('Headers:', headers);
  console.log('Full URL:', url);
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
  console.groupEnd();
}

export function logApiResponse(method: string, url: string, status: number, data?: unknown): void {
  const statusColor = status >= 200 && status < 300 ? '✅' : '❌';
  console.group(`${statusColor} API Response: ${status}`);
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Status:', status);
  console.log('Data:', data);
  console.groupEnd();
}

export function logApiError(method: string, url: string, error: Error): void {
  console.group('❌ API Error');
  console.error('Method:', method);
  console.error('URL:', url);
  console.error('Error:', error);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.groupEnd();
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hrms-dev-admin-backend.truetym.com';
  // Remove trailing slash from baseUrl and leading slash from endpoint
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${cleanBase}/${cleanEndpoint}`;
}
