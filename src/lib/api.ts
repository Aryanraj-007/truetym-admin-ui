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

export interface CreateCustomPlanRequest {
  planName: string;
  planDescription?: string;
  billingAmount: number;
  billingFrequency: number;
  billingPeriod: 'monthly' | 'yearly';
}

export interface CreateCustomPlanResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    planName: string;
    planDescription?: string;
    billingAmount: number;
    billingFrequency: number;
    createdAt: number;
  };
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

// Fetch subscriptions/plans
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

// Create custom plan
export async function createCustomPlan(
  planData: CreateCustomPlanRequest,
): Promise<CreateCustomPlanResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/plans/create-custom-plan`;
    console.log('Creating custom plan:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(planData),
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
    console.error('createCustomPlan error:', errorMessage);
    throw new Error(`Failed to create custom plan: ${errorMessage}`);
  }
}

// Delete custom plan
export async function deleteCustomPlan(planId: string): Promise<CreateCustomPlanResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/plans/custom-plan/${planId}`;
    console.log('Deleting custom plan:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    console.error('deleteCustomPlan error:', errorMessage);
    throw new Error(`Failed to delete custom plan: ${errorMessage}`);
  }
}

// Get plan details by ID
export interface PlanDetailsResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    razorpay_plan_id: string;
    title: string;
    description: string | null;
    plan_type: number;
    featureList: Array<{
      id: string;
      title: string;
      subFeatures: Array<{
        id: string;
        title: string;
        featureRoutes: {
          id: string | null;
          pages: string[] | null;
          title: string;
          routes: string[] | null;
        };
      }>;
    }>;
  };
}

export async function getPlanDetails(planId: string): Promise<PlanDetailsResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/plans/${planId}`;
    console.log('Fetching plan details:', url);

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
    console.error('getPlanDetails error:', errorMessage);
    throw new Error(`Failed to fetch plan details: ${errorMessage}`);
  }
}

// Delete system plan
export async function deleteSystemPlan(planId: string): Promise<CreateCustomPlanResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/plans/system-plan/${planId}`;
    console.log('Deleting system plan:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    console.error('deleteSystemPlan error:', errorMessage);
    throw new Error(`Failed to delete system plan: ${errorMessage}`);
  }
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

export async function fetchPlanDetails(planId: string): Promise<PlanDetailsResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/plans/${planId}`;
    console.log('Fetching plan details from:', url);

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
    console.error('fetchPlanDetails error:', errorMessage);
    throw new Error(`Failed to fetch plan details: ${errorMessage}`);
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

// Features API Interfaces
export interface FeatureRoute {
  id?: string | null;
  title?: string;
  routes?: string[];
  pages?: string[];
}

export interface APISubFeature {
  id: string;
  title: string;
  descriptions: string | null;
  featureRoutes?: FeatureRoute;
}

export interface APIFeature {
  id: string;
  title: string;
  descriptions: string;
  subFeatures: APISubFeature[];
}

export interface FeaturesResponse {
  message: string[];
  succeeded: boolean;
  data: APIFeature[];
}

export interface CreateFeatureRequest {
  title: string;
  description?: string;
}

export interface CreateFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    createdAt: number;
  };
}

// Fetch features from master data
export async function fetchFeatures(): Promise<FeaturesResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features`;
    console.log('Fetching features from:', url);

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
    console.error('fetchFeatures error:', errorMessage);
    throw new Error(`Failed to fetch features: ${errorMessage}`);
  }
}

// Create a new feature
export async function createFeature(payload: CreateFeatureRequest): Promise<CreateFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/create-feature`;
    console.log('Creating feature at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
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
    console.error('createFeature error:', errorMessage);
    throw new Error(`Failed to create feature: ${errorMessage}`);
  }
}

export interface DeleteFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: Record<string, never>;
}

// Delete a feature by ID
export async function deleteFeature(featureId: string): Promise<DeleteFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/${featureId}`;
    console.log('Deleting feature at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    console.error('deleteFeature error:', errorMessage);
    throw new Error(`Failed to delete feature: ${errorMessage}`);
  }
}

export interface UpdateFeatureRequest {
  title: string;
  descriptions?: string;
}

export interface UpdateFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    title: string;
    descriptions: string;
  };
}

// Update a feature by ID
export async function updateFeature(
  featureId: string,
  payload: UpdateFeatureRequest,
): Promise<UpdateFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/${featureId}`;
    console.log('Updating feature at:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
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
    console.error('updateFeature error:', errorMessage);
    throw new Error(`Failed to update feature: ${errorMessage}`);
  }
}

// Sub-Feature API Interfaces and Functions
export interface CreateSubFeatureRequest {
  title: string;
  descriptions?: string;
  razorpayPlanId?: string;
  featureRoutes?: {
    id?: string | null;
    title?: string;
    routes?: string[];
    pages?: string[];
  };
}

export interface CreateSubFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    title: string;
    featureId: string;
    createdAt: number;
  };
}

// Create a new sub-feature under a parent feature
export async function createSubFeature(
  featureId: string,
  payload: CreateSubFeatureRequest,
): Promise<CreateSubFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/${featureId}/subfeatures`;
    console.log('Creating sub-feature at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
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
    console.error('createSubFeature error:', errorMessage);
    throw new Error(`Failed to create sub-feature: ${errorMessage}`);
  }
}

// Update an existing sub-feature
export interface UpdateSubFeatureRequest {
  title?: string;
  descriptions?: string;
  razorpayPlanId?: string;
  featureRoutes?: {
    id?: string | null;
    title?: string;
    routes?: string[];
    pages?: string[];
  };
}

export interface UpdateSubFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    title: string;
    featureId: string;
  };
}

export async function updateSubFeature(
  featureId: string,
  subFeatureId: string,
  payload: UpdateSubFeatureRequest,
): Promise<UpdateSubFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/${featureId}/subfeatures/${subFeatureId}`;
    console.log('Updating sub-feature at:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
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
    console.error('updateSubFeature error:', errorMessage);
    throw new Error(`Failed to update sub-feature: ${errorMessage}`);
  }
}

// Delete a sub-feature
export interface DeleteSubFeatureResponse {
  message: string[];
  succeeded: boolean;
  data: Record<string, never>;
}

export async function deleteSubFeature(
  featureId: string,
  subFeatureId: string,
): Promise<DeleteSubFeatureResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/${featureId}/subfeatures/${subFeatureId}`;
    console.log('Deleting sub-feature at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    console.error('deleteSubFeature error:', errorMessage);
    throw new Error(`Failed to delete sub-feature: ${errorMessage}`);
  }
}

export interface FeatureRouteResponse {
  message: string[];
  succeeded: boolean;
  data: FeatureRoute[];
}

export async function fetchFeatureRoutes(): Promise<FeatureRouteResponse> {
  try {
    const url = `${API_BASE_URL}/master-data/features/routes`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch feature routes: ${errorMessage}`);
  }
}
