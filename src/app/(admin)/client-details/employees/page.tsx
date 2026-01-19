import { Suspense } from 'react';

import EmployeesClient from '@/app/(admin)/client-details/employees/EmployeesClient';

export default function EmployeesPage() {
  return (
    <Suspense fallback={<EmployeesLoading />}>
      <EmployeesClient />
    </Suspense>
  );
}

function EmployeesLoading() {
  return (
    <div className="p-8">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
        Loading employees...
      </div>
    </div>
  );
}
