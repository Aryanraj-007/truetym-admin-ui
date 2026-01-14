'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { fetchSubscriptions, Organization, Subscription } from '@/lib/api';
import OrganizationDetail from '@/components/common/admin-panel/OrganizationDetail';

interface OrganizationWithSubscription extends Organization {
  name?: string | undefined;
  email?: string | undefined;
  employees?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar: string;
  }>;
}


const formatDateTime = (date?: number | string | null) => {
  if (!date) return '-';

  const timestamp =
    typeof date === 'number' && date < 1e12 ? date * 1000 : date;

  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '-';

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

export default function OrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.organizationId as string;

  const [organization, setOrganization] =
    useState<OrganizationWithSubscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoading(true);
        setError(null);

        
        try {
          const subsResponse = await fetchSubscriptions();
          setSubscriptions(subsResponse.data);
        } catch {
          console.log('error while fetching subscription');
        }

        
        const mockOrganization: OrganizationWithSubscription = {
          id: organizationId,
          org_name: `Organization ${organizationId.substring(0, 8)}`,
          employee_count: 10,
          created_at: new Date().toISOString(),
          planTitle: 'Pro',
          planAmount: 149,
          status: 102,
          total_licences: 20,

         
          subscription_date: Math.floor(Date.now() / 1000),
          subscription_start_date: Math.floor(Date.now() / 1000),
          subscription_closed_date: Math.floor(
            (Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000,
          ),

          pricing: {
            userCount: 10,
            monthlyCost: 1490,
            yearlyCost: 0,
          },
          isSeatAvailable: true,
          website: 'example.com',
          employees: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'Admin',
              status: 'Active',
              avatar: 'JD',
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'Manager',
              status: 'Active',
              avatar: 'JS',
            },
          ],
        };

        setOrganization(mockOrganization);
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
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="mb-6 flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-600 transition-colors hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </button>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            Loading organization data...
          </div>
        )}

        {/* Main Content */}
        {!loading && organization && (
          <div className="space-y-6">
            {/* Organization Detail */}
            <OrganizationDetail
              organization={{
                ...organization,
                subscription_start_date: formatDateTime(
                  organization.subscription_start_date,
                ),
                subscription_closed_date: formatDateTime(
                  organization.subscription_closed_date,
                ),
              }}
            />

            {/* Subscriptions */}
            {subscriptions.length > 0 && (
              <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Subscription Plans
                </h2>

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
                          Customers:{' '}
                          <span className="font-medium">
                            {sub.totalCustomers}
                          </span>
                        </p>
                        {sub.description && (
                          <p className="line-clamp-2">{sub.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">📌 TODO</p>
              <ul className="mt-3 ml-5 list-disc space-y-1 text-xs text-blue-600">
                <li>Create real API for organization details</li>
                <li>Remove mock data once backend is ready</li>
                <li>Normalize timestamps to milliseconds</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
