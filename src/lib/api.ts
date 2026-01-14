// API configuration and service functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://hrms-dev-admin-backend.truetym.com';

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

  // Fallback to environment variable for testing
  const envToken = process.env.NEXT_PUBLIC_TEMP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_AUTH_TOKEN;
  if (envToken) {
    console.warn('Using fallback token from environment');
    return envToken;
  }

  return null;
}

// Build headers with authentication
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    // Log the token being used (for debugging only)
    console.log('Using auth token:', token.substring(0, 20) + '...');
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found');
  }

  return headers;
}

// Types for API responses
export interface Organization {
  id: string;
  org_name: string;
  industry_id?: string;
  website?: string;
  employee_slab_id?: string;
  employee_count: number;
  created_at: string;
  subscription_id?: string;
  razorpay_subscription_id?: string;
  planTitle?: string;
  planAmount: number;
  subscription_type?: number;
  status?: number;
  total_licences: number;
  subscription_date: string | number;
  subscription_start_date: string | number;
  subscription_closed_date: string | number;
  trial_end_at?: string | null;
  pricing: {
    userCount: number;
    monthlyCost: number;
    yearlyCost: number;
  };
  isSeatAvailable: boolean;
}

export interface Subscription {
  id: string;
  razorpay_plan_id: string;
  plan_type: number;
  title: string;
  currency: string;
  description?: string;
  amount: number;
  created_at: string;
  typeId: string;
  totalFeatures: number;
  totalCustomers: number;
  customerDetails: Array<{
    id: string;
    name: string;
  }>;
}

export interface OrganizationListResponse {
  message: string[];
  succeeded: boolean;
  totalItems: number;
  data: Organization[];
}

export interface SubscriptionsResponse {
  message: string[];
  succeeded: boolean;
  data: Subscription[];
}

export interface Employee {
  id: string;
  user_code: string;
  employeeTypeId: number;
  display_name: string;
  email_id: string;
  dial_code: string;
  phone_number: string;
  profile_image: string | null;
  joining_date: string;
  status: number;
  job_title: string | null;
  role_id: string;
  role_type: number;
  role_name: string;
}

export interface EmployeesResponse {
  message: string[];
  succeeded: boolean;
  totalItems: string | number;
  data: Employee[];
}

// Fetch organizations list
export async function fetchOrganizations(
  pageNumber: number = 1,
  pageSize: number = 10,
  name: string = '',
  subscriptionPlan: string = '',
  trialStatus: string = '',
  fieldName: string = 'created_at',
  orderBy: string = 'ASC',
): Promise<OrganizationListResponse> {
  try {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      name: name,
      subscriptionPlan: subscriptionPlan,
      trialStatus: trialStatus,
      fieldName: fieldName,
      orderBy: orderBy,
    });

    const url = `${API_BASE_URL}/organisations?${params.toString()}`;
    console.log('Fetching organizations from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchOrganizations error:', errorMessage);
    throw new Error(`Failed to fetch organizations: ${errorMessage}`);
  }
}

// Fetch subscriptions
export async function fetchSubscriptions(): Promise<SubscriptionsResponse> {
  try {
    const url = `${API_BASE_URL}/dashborad/subscriptions`;
    console.log('Fetching subscriptions from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchSubscriptions error:', errorMessage);
    throw new Error(`Failed to fetch subscriptions: ${errorMessage}`);
  }
}

// Utility function to format timestamp to readable date
export function formatDate(timestamp: string | number): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
  const date = new Date(ts * (ts.toString().length === 10 ? 1000 : 1));

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Utility function to get status label from status code
export function getStatusLabel(status?: number): string {
  if (status === undefined || status === null) {
    return 'Inactive';
  }
  // Status 102 seems to be Active, others are Inactive
  return status === 102 ? 'Active' : 'Inactive';
}

// Fetch employees for an organization
export async function fetchEmployees(
  organizationId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  code: string = '',
  name: string = '',
  email: string = '',
  fieldName: string = '',
  orderBy: string = 'ASC',
  status: string = '',
): Promise<EmployeesResponse> {
  try {
    const params = new URLSearchParams({
      code: code,
      name: name,
      email: email,
      fieldName: fieldName,
      orderBy: orderBy,
      status: status,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `${API_BASE_URL}/organisations/${organizationId}/employees?${params.toString()}`;
    console.log('Fetching employees from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchEmployees error:', errorMessage);
    throw new Error(`Failed to fetch employees: ${errorMessage}`);
  }
}

