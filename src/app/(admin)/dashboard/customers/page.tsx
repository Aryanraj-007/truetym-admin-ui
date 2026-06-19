'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import { fetchOrganizations, getStatusLabel, Organization } from '@/lib/api';

const subscriptionOptions = ['Pro', 'Basic', 'Standard', 'Core'];

const formatSubscriptionDate = (value?: string | number | null): string => {
  if (!value) return '-';

  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return '-';

  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const truncateOrgName = (name?: string, maxLength = 12) => {
  if (!name) return '-';
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const getTotalLicences = (total?: number | null) => {
  return total && total > 0 ? total : 10;
};

export default function CustomersPage() {
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    name: '',
    subscriptionPlan: '',
    trialStatus: '',
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchOrganizations(
          pageNumber,
          pageSize,
          filters.name,
          filters.subscriptionPlan,
          filters.trialStatus,
          'created_at',
          'ASC',
        );

        if (!response.succeeded) {
          throw new Error(response.message?.join(', ') || 'API Error');
        }

        setOrganizations(response.data);
        setTotalItems(response.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [pageNumber, pageSize, filters]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      if (filters.name && !org.org_name?.toLowerCase().includes(filters.name.toLowerCase()))
        return false;

      if (filters.subscriptionPlan && org.planTitle !== filters.subscriptionPlan) return false;

      if (filters.trialStatus) {
        const statusLabel = getStatusLabel(org.status)?.toLowerCase();
        if (statusLabel !== filters.trialStatus) return false;
      }

      return true;
    });
  }, [organizations, filters]);

  const handleRowClick = (id: string) => {
    router.push(`/client-details/employees?id=${id}`);
  };

  // NEW: open offboarding for an inactive org
  const handleOffboard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/offboarding/${id}?type=org`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
  };

  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading organizations</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden p-8">
      <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
      <p className="mb-4 text-gray-500">Manage all organizations and their members</p>

      <div className="grow">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className="h-8 w-56 rounded border border-gray-300 px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />

          <select
            value={filters.subscriptionPlan}
            onChange={(e) => handleFilterChange('subscriptionPlan', e.target.value)}
            className="h-8 w-40 rounded border border-gray-300 px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Plans</option>
            {subscriptionOptions.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>

          <select
            value={filters.trialStatus}
            onChange={(e) => handleFilterChange('trialStatus', e.target.value)}
            className="h-8 w-40 rounded border border-gray-300 px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading organizations...</div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-hidden rounded border bg-white">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Organization',
                    'Website',
                    'Employees',
                    'Plan',
                    'Joining Date',
                    'Renewal Date',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                      No record found.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((org) => {
                    const statusLabel = getStatusLabel(org.status) || 'Inactive';
                    const isActive = statusLabel === 'Active';

                    return (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-base font-semibold">
                          <span
                            role="none"
                            title={org.org_name}
                            onClick={() => handleRowClick(org.id)}
                            className="cursor-pointer hover:text-teal-600"
                          >
                            {truncateOrgName(org.org_name)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">{org.website || '-'}</td>

                        <td className="px-4 py-3 text-sm">
                          {org.pricing.userCount ?? 0}/{getTotalLicences(org.total_licences)}
                        </td>

                        <td className="px-4 py-3 text-sm">{org.planTitle}</td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatSubscriptionDate(org.subscription_start_date)}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatSubscriptionDate(org.subscription_closed_date)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-3 py-1 text-xs font-semibold ${
                              isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>

                        {/* NEW: offboard action — only for inactive orgs */}
                        <td className="px-4 py-3">
                          {isActive ? (
                            <span
                              title="Only inactive organisations can be offboarded"
                              className="text-xs text-gray-300"
                            >
                              —
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleOffboard(e, org.id)}
                              title="Offboard (permanent delete)"
                              className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="mt-auto flex items-center justify-between pt-4 text-sm text-gray-600">
          <span>
            Showing {startItem}–{endItem} of {totalItems} entries
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>Items per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 rounded border border-gray-300 px-2 text-xs"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
