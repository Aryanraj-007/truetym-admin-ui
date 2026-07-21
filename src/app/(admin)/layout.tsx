import AdminContentLayout from '@/components/common/admin-panel/AdminContentLayout';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminContentLayout>{children}</AdminContentLayout>;
}
