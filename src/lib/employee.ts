import { getHeaders } from '@/lib/api';
import { API_BASE_URL } from '@/lib/endpoint';

// ---------------------------------------------------------------------------
// UserStatusEnum (matches your backend constant)
// ---------------------------------------------------------------------------
export const UserStatusEnum = {
  InvitationSent: 100,
  Registered: 101,
  XEmployee: 102,
} as const;

export function getUserStatusLabel(status: number): string {
  switch (status) {
    case UserStatusEnum.InvitationSent:
      return 'Invited';
    case UserStatusEnum.Registered:
      return 'Active';
    case UserStatusEnum.XEmployee:
      return 'Offboarded';
    default:
      return 'Unknown';
  }
}

/** Tailwind badge classes per status. */
export function getUserStatusBadgeClass(status: number): string {
  switch (status) {
    case UserStatusEnum.Registered:
      return 'bg-green-100 text-green-800';
    case UserStatusEnum.InvitationSent:
      return 'bg-amber-100 text-amber-800';
    case UserStatusEnum.XEmployee:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// ---- deleted-aware variants (deleted = 1 overrides status) -----------------
export function getEmployeeStatusLabel(status: number, deleted?: number): string {
  return deleted === 1 ? 'Deleted' : getUserStatusLabel(status);
}

export function getEmployeeStatusBadgeClass(status: number, deleted?: number): string {
  return deleted === 1 ? 'bg-gray-800 text-white' : getUserStatusBadgeClass(status);
}

/** Only invitation-sent and ex-employees are offboardable from this screen. */
export function isOffboardableEmployee(status: number): boolean {
  return status === UserStatusEnum.InvitationSent || status === UserStatusEnum.XEmployee;
}

/** Deleted users are always offboardable (prime cleanup targets). */
export function canOffboardEmployee(status: number, deleted?: number): boolean {
  return deleted === 1 || isOffboardableEmployee(status);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EmployeeListItem {
  id: string;
  user_code: string;
  employeeTypeId: number;
  display_name: string;
  email_id: string;
  dial_code: string;
  phone_number: string;
  profile_image: string;
  joining_date: string;
  status: number;
  is_active: number;
  deleted: number;
  job_title: string;
  role_id: string | null;
  role_type: number | null;
  role_name: string | null;
}

export interface EmployeeListResponse {
  succeeded: boolean;
  message: string[];
  totalItems: number;
  data: EmployeeListItem[];
}

export interface EmployeeListParams {
  pageNumber: number;
  pageSize: number;
  name?: string;
  email?: string;
  code?: string;
  status?: number | '';
  fieldName?: string;
  orderBy?: string;
}

// ---------------------------------------------------------------------------
// GET /organisation/:id/employees
// ---------------------------------------------------------------------------
export async function fetchEmployeeList(
  organisationId: string,
  params: EmployeeListParams,
): Promise<EmployeeListResponse> {
  try {
    const qs = new URLSearchParams({
      pageNumber: String(params.pageNumber),
      pageSize: String(params.pageSize),
      name: params.name ?? '',
      email: params.email ?? '',
      code: params.code ?? '',
      status: params.status === undefined ? '' : String(params.status),
      fieldName: params.fieldName ?? '',
      orderBy: params.orderBy ?? '',
    });

    // Adjust the prefix if your organisation controller uses a different path.
    const url = `${API_BASE_URL}/organisation/${organisationId}/employees?${qs.toString()}`;
    console.log('Fetching employees at:', url);

    const response = await fetch(url, { method: 'GET', headers: getHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...data, totalItems: Number(data.totalItems ?? 0) } as EmployeeListResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('fetchEmployeeList error:', errorMessage);
    throw new Error(`Failed to fetch employees: ${errorMessage}`);
  }
}
