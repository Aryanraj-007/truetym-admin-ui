'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';

import {
  fetchEmployees,
  Employee,
  EmployeesResponse,
} from '@/lib/api';

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('id');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orgName, setOrgName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
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

        if (empResponse && empResponse.succeeded) {
          setEmployees(empResponse.data);
          setTotalItems(parseInt(empResponse.totalItems.toString(), 10));
          console.log('Employees fetched:', empResponse.data);
        } else {
          setError(empResponse?.message?.join(', ') || 'Failed to fetch employees');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch employees';
        setError(errorMsg);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [organizationId, pageNumber]);

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <p className="mt-1 text-gray-500">Employee list for the selected organization</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Error loading employees</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Loading employees...
        </div>
      )}

      {/* Employees Table */}
      {!loading && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Emp code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Email ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Phone no.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((emp) => (
                  <tr key={emp.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{emp.display_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{emp.user_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{emp.email_id || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {emp.dial_code} {emp.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{emp.role_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          emp.status === 101
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {emp.status === 101 ? 'Registered' : 'Invitation sent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-600 transition-colors hover:text-gray-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {employees.length === 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-gray-600">No employees found for this organization.</p>
            </div>
          )}

          {/* Pagination info */}
          {employees.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing page {pageNumber} of {Math.ceil(totalItems / pageSize)} ({totalItems}{' '}
                total items)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber >= Math.ceil(totalItems / pageSize)}
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
