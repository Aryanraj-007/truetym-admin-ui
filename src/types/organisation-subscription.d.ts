export type OrgStatus = 'active' | 'trial' | 'inactive';
export type SubscriptionMode = 'auto' | 'manual';

export interface OrganizationExtra {
  created_at: number;
  subscription_mode: SubscriptionMode;
  is_free_trial: number;
  current_start: number;
  current_end: number;
  trial_end_at: number;
  total_licences: number;
  planTitle: string | null;
  org_status: OrgStatus; // authoritative, derived server-side
}
