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
