import AdminContentLayout from '@/components/common/admin-panel/AdminContentLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminContentLayout>{children}</AdminContentLayout>;
}
