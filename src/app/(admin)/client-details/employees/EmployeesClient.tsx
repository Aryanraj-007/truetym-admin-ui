'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { Employee, EmployeesResponse } from '@/types/employee';
import { fetchEmployees } from '@/lib/api';
import {
  canOffboardEmployee,
  getEmployeeStatusBadgeClass,
  getEmployeeStatusLabel,
} from '@/lib/employee';

// Employee from @/lib/api may not yet type these — add them there too.
type EmployeeRow = Employee & {
  status?: number;
  is_active?: number;
  deleted?: number;
};

export default function EmployeesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('id');

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);

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

        // NOTE: 10th arg `showDeleted` — thread it through fetchEmployees()
        // and the /:id/employees endpoint (see backend getEmployeeList update).
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
          showDeleted as any,
        );

        if (empResponse?.succeeded) {
          setEmployees(empResponse.data as EmployeeRow[]);
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
  }, [organizationId, pageNumber, pageSize, showDeleted]);

  const handleOffboard = (id: string) => {
    router.push(`/offboarding/${id}?type=user`);
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => {
              setShowDeleted(e.target.checked);
              setPageNumber(1);
            }}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          {''}
          Show deleted users
        </label>
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((emp) => {
                  const isDeleted = emp.deleted === 1;
                  const status = emp.status ?? -1;
                  const offboardable = canOffboardEmployee(status, emp.deleted);
                  return (
                    <tr key={emp.id} className={isDeleted ? 'bg-gray-50 opacity-70' : ''}>
                      <td className={`px-6 py-4 ${isDeleted ? 'text-gray-500 line-through' : ''}`}>
                        {emp.display_name}
                      </td>
                      <td className="px-6 py-4">{emp.user_code}</td>
                      <td className="px-6 py-4">{emp.email_id || '-'}</td>
                      <td className="px-6 py-4">{emp.role_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getEmployeeStatusBadgeClass(
                            status,
                            emp.deleted,
                          )}`}
                        >
                          {getEmployeeStatusLabel(status, emp.deleted)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {offboardable ? (
                          <button
                            onClick={() => handleOffboard(emp.id)}
                            title="Offboard (permanent delete)"
                            className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            title="Only invited, offboarded or deleted users can be offboarded"
                            className="text-xs text-gray-300"
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <span>
              Page {pageNumber} of {Math.max(1, Math.ceil(totalItems / pageSize))}
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
