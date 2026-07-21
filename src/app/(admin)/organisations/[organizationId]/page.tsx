'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Organization } from '@/types/organisation';
import { Subscription } from '@/types/subscription';
import { fetchSubscriptions } from '@/lib/api';
import { fetchEmployeeList } from '@/lib/employee';
import OrganizationDetail, { Employee } from '@/components/common/admin-panel/OrganizationDetail';

interface OrganizationWithSubscription extends Organization {
  name?: string;
  email?: string;
  employees?: Employee[];
}

const formatDateTime = (date?: number | string | null) => {
  if (!date) return '-';
  const timestamp = typeof date === 'number' && date < 1e12 ? date * 1000 : date;
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const initialsOf = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

export default function OrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.organizationId as string;

  const [organization, setOrganization] = useState<OrganizationWithSubscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscriptions (unchanged)
        try {
          const subsResponse = await fetchSubscriptions();
          setSubscriptions(subsResponse.data);
        } catch {
          /* ignore */
        }

        // REAL employees for this org
        let employees: Employee[] = [];
        try {
          const empRes = await fetchEmployeeList(organizationId, {
            pageNumber: 1,
            pageSize: 100,
          });
          if (empRes.succeeded) {
            employees = empRes.data.map((e) => ({
              id: e.id,
              name: e.display_name,
              email: e.email_id,
              role: e.role_name ?? '-',
              status: e.status, // numeric UserStatusEnum
              is_active: e.is_active,
              deleted: e.deleted,
              profile_image: e.profile_image,
              avatar: initialsOf(e.display_name),
            }));
          }
        } catch (e) {
          console.error('Employee fetch failed:', e);
        }

        // Org header — still partly placeholder until the single-org GET exists.
        const org: OrganizationWithSubscription = {
          id: organizationId,
          org_name: `Organization ${organizationId.substring(0, 8)}`,
          employee_count: employees.length,
          created_at: new Date().toISOString(),
          planTitle: 'Pro',
          planAmount: 149,
          status: 102,
          total_licences: 20,
          subscription_date: Math.floor(Date.now() / 1000),
          subscription_start_date: Math.floor(Date.now() / 1000),
          subscription_closed_date: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
          pricing: { userCount: employees.length, monthlyCost: 1490, yearlyCost: 0 },
          isSeatAvailable: true,
          website: 'example.com',
          employees,
        };

        setOrganization(org);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [organizationId]);

  return (
    <div className="w-full overflow-hidden bg-gray-50">
      <div className="w-full px-6 py-8">
        <button
          onClick={() => router.push('/organisations')}
          className="mb-6 flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-600 transition-colors hover:text-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </button>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            Loading organization data...
          </div>
        )}

        {!loading && organization && (
          <div className="space-y-6">
            <OrganizationDetail
              organization={{
                name: organization.org_name,
                email: organization.email ?? '-',
                status:
                  organization.status === 102 ||
                  organization.status === 103 ||
                  organization.status === 110 ||
                  organization.status === 111 ||
                  organization.status === 105
                    ? 'Active'
                    : 'Inactive',
                role: organization.planTitle,
                subscription_start_date: formatDateTime(organization.subscription_start_date),
                subscription_closed_date: formatDateTime(organization.subscription_closed_date),
                employees: organization.employees ?? [],
              }}
            />

            {subscriptions.length > 0 && (
              <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Subscription Plans</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {sub.title}
                      </h3>
                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        <p>
                          Amount:{' '}
                          <span className="font-medium">
                            {sub.currency} {sub.amount}
                          </span>
                        </p>
                        <p>
                          Type:{' '}
                          <span className="font-medium">
                            {sub.plan_type === 100 ? 'Monthly' : 'Yearly'}
                          </span>
                        </p>
                        <p>
                          Customers: <span className="font-medium">{sub.totalCustomers}</span>
                        </p>
                        {sub.description && <p className="line-clamp-2">{sub.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
