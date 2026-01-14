'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Employee, EmployeesResponse, fetchEmployees } from '@/lib/api';

export default function EmployeesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('id');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!organizationId) {
      setError('Organization ID not provided');
      setLoading(false);
      return;
    }

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const empResponse: EmployeesResponse = await fetchEmployees(
          organizationId,
          pageNumber,
          pageSize,
          '',
          '',
          '',
          '',
          'ASC',
          '',
        );

        if (empResponse?.succeeded) {
          setEmployees(empResponse.data);
          setTotalItems(Number(empResponse.totalItems) || 0);
        } else {
          setError(empResponse?.message?.join(', ') || 'Failed to fetch employees');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [organizationId, pageNumber, pageSize]);

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </button>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">Employees</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Error loading employees</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Loading employees...
        </div>
      )}

      {!loading && employees.length === 0 && (
        <div className="mt-6 rounded-lg border bg-gray-50 p-6 text-center">No employees found.</div>
      )}

      {!loading && employees.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Emp code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4">{emp.display_name}</td>
                    <td className="px-6 py-4">{emp.user_code}</td>
                    <td className="px-6 py-4">{emp.email_id || '-'}</td>
                    <td className="px-6 py-4">{emp.role_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <span>
              Page {pageNumber} of {Math.ceil(totalItems / pageSize)}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pageNumber >= Math.ceil(totalItems / pageSize)}
                onClick={() => setPageNumber((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
