export enum RazorPaySubscriptionStatusEnum {
  created = 100,
  authenticated = 101,
  active = 102,
  pending = 103,
  halted = 104,
  cancelled = 105,
  completed = 106,
  expired = 107,
  paused = 108,
  failed = 109,
  pending_cancel = 110,
  scheduled = 111,
}

export const RZP_STATUS_LABEL: Record<number, string> = {
  [RazorPaySubscriptionStatusEnum.created]: 'Created',
  [RazorPaySubscriptionStatusEnum.authenticated]: 'Authenticated',
  [RazorPaySubscriptionStatusEnum.active]: 'Active',
  [RazorPaySubscriptionStatusEnum.pending]: 'Pending',
  [RazorPaySubscriptionStatusEnum.halted]: 'Halted',
  [RazorPaySubscriptionStatusEnum.cancelled]: 'Cancelled',
  [RazorPaySubscriptionStatusEnum.completed]: 'Completed',
  [RazorPaySubscriptionStatusEnum.expired]: 'Expired',
  [RazorPaySubscriptionStatusEnum.paused]: 'Paused',
  [RazorPaySubscriptionStatusEnum.failed]: 'Failed',
  [RazorPaySubscriptionStatusEnum.pending_cancel]: 'Pending Cancel',
  [RazorPaySubscriptionStatusEnum.scheduled]: 'Scheduled',
};
