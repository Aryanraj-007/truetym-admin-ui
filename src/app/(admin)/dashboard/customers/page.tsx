'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

import { fetchOrganizations, formatDate, getStatusLabel, Organization } from '@/lib/api';

const subscriptionOptions = ['Pro', 'Basic', 'Standard', 'Core'];

export default function CustomersPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    subscriptionPlan: '',
    trialStatus: '',
  });

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizations(
          pageNumber,
          pageSize,
          filters.name,
          filters.subscriptionPlan,
          filters.trialStatus,
          'created_at',
          'ASC',
          // useMockData,
        );

        if (!response.succeeded) {
          throw new Error(response.message?.join(', ') || 'API returned error');
        }

        setOrganizations(response.data);
        setTotalItems(response.totalItems);
      } catch (apiError) {
        // On API error, fall back to mock data
        if (!useMockData) {
          setUseMockData(true);

          const mockResponse = await fetchOrganizations(
            pageNumber,
            pageSize,
            filters.name,
            filters.subscriptionPlan,
            filters.trialStatus,
            'created_at',
            'ASC',
            // true, // Use mock data
          );

          setOrganizations(mockResponse.data);
          setTotalItems(mockResponse.totalItems);
          setError(
            `API Error - Using sample data. ${apiError instanceof Error ? apiError.message : ''}`,
          );
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch organizations';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations on component mount and when pagination/filters change
  useEffect(() => {
    loadOrganizations();
  }, [pageNumber, filters, useMockData, pageSize]);

  const handleSubscriptionChange = (idx: number, newPlan: string) => {
    const updated = [...organizations];
    updated[idx].planTitle = newPlan;
    setOrganizations(updated);
    // TODO: Add API call to update subscription if needed
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/customers/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      setOrganizations((orgs) => orgs.filter((org) => org.id !== id));
      // TODO: Add API call to delete organization
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <p className="mt-1 text-gray-500">Manage all organizations and their members</p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={`mb-6 rounded-lg border p-4 ${useMockData ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}
        >
          <p className={`font-semibold ${useMockData ? 'text-yellow-700' : 'text-red-700'}`}>
            {useMockData ? 'ℹ️ Using Sample Data' : 'Error loading organizations'}
          </p>
          <p className={`mt-2 text-sm ${useMockData ? 'text-yellow-600' : 'text-red-600'}`}>
            {error}
          </p>

          {useMockData && (
            <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-semibold text-blue-700">💡 Tip: Set Your Token</p>
              <p className="mt-1 text-xs text-blue-600">Open browser DevTools Console and run:</p>
              <code className="mt-1 block rounded bg-white p-2 font-mono text-xs text-blue-600">
                localStorage.setItem(&apos;authToken&apos;, &apos;your_valid_token_here&apos;)
              </code>
            </div>
          )}

          <details className="mt-2">
            <summary
              className={`cursor-pointer text-sm ${useMockData ? 'text-yellow-600' : 'text-red-600'}`}
            >
              Debug Info
            </summary>
            <p
              className={`mt-1 font-mono text-xs ${useMockData ? 'text-yellow-600' : 'text-red-600'}`}
            >
              API URL: {process.env.NEXT_PUBLIC_API_URL}
            </p>
            <p className={`mt-1 text-xs ${useMockData ? 'text-yellow-600' : 'text-red-600'}`}>
              Check browser console (F12) for more details
            </p>
          </details>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Loading organizations...
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(e) => {
            setFilters({ ...filters, name: e.target.value });
            setPageNumber(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <select
          value={filters.subscriptionPlan}
          onChange={(e) => {
            setFilters({ ...filters, subscriptionPlan: e.target.value });
            setPageNumber(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="Pro">Pro</option>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Core">Core</option>
        </select>
        <select
          value={filters.trialStatus}
          onChange={(e) => {
            setFilters({ ...filters, trialStatus: e.target.value });
            setPageNumber(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {!loading && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Organisation Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Subscription Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Onboarding Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Renew Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {organizations.map((org) => (
                  <tr key={org.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{org.org_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{org.website || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {org.pricing.userCount}/{org.total_licences}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={org.planTitle || ''}
                        onChange={(e) => {
                          const idx = organizations.findIndex((o) => o.id === org.id);
                          handleSubscriptionChange(idx, e.target.value);
                        }}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        {subscriptionOptions.map((plan) => (
                          <option key={plan} value={plan}>
                            {plan}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(org.subscription_start_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(org.subscription_closed_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          getStatusLabel(org.status) === 'Active'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {getStatusLabel(org.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(org.id)}
                          className="text-gray-600 transition-colors hover:text-gray-900"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          className="text-gray-600 transition-colors hover:text-red-600"
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

          {/* Pagination info */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing page {pageNumber} of {Math.ceil(totalItems / pageSize)} ({totalItems} total
              items)
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
        </>
      )}
    </div>
  );
}
