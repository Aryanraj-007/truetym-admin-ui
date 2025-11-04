import { AdminContentLayout } from '@/components/common/admin-panel/AdminContentLayout';
import Payments from '@/components/common/admin-panel/Payments';

export default function DashboardPage() {
  return (
    <AdminContentLayout title="About">
      <Payments />
    </AdminContentLayout>
  );
}
