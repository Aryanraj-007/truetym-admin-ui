import AdminContentLayout from '@/components/admin-panel/AdminContentLayout';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminContentLayout>{children}</AdminContentLayout>;
}
