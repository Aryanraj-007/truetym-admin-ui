export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SALE_EXECUTIVE = 'sale_executive',
  SALE = 'sale',
  OPERATION_HEAD = 'operation_head',
  VIEW_ONLY = 'view_only',
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  [AdminRole.SUPER_ADMIN]: 'Super Admin',
  [AdminRole.ADMIN]: 'Admin',
  [AdminRole.SALE_EXECUTIVE]: 'Sale Executive',
  [AdminRole.SALE]: 'Sale',
  [AdminRole.OPERATION_HEAD]: 'Operation Head',
  [AdminRole.VIEW_ONLY]: 'View Only',
};

export const ROLE_ASSIGNERS = [AdminRole.SUPER_ADMIN, AdminRole.ADMIN];
