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

export interface OrganizationListResponse {
  message: string[];
  succeeded: boolean;
  totalItems: number;
  data: Organization[];
}
