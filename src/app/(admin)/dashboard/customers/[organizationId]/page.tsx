'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { fetchSubscriptions, Organization, Subscription } from '@/lib/api';
import OrganizationDetail from '@/components/common/admin-panel/OrganizationDetail';

interface OrganizationWithSubscription extends Organization {
  name?: string;
  email?: string;
  employees?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar: string;
  }>;
}

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

        // Try to fetch subscriptions data
        try {
          const subsResponse = await fetchSubscriptions();
          setSubscriptions(subsResponse.data);
        } catch {
          const fallbackResponse = await fetchSubscriptions(true);
          setSubscriptions(fallbackResponse.data);
        }

        // For now, create a mock organization from the ID
        // TODO: Fetch organization details from API: GET /organisations/:id
        const mockOrganization: OrganizationWithSubscription = {
          id: organizationId,
          org_name: `Organization ${organizationId.substring(0, 8)}`,
          employee_count: 10,
          created_at: new Date().toISOString(),
          planTitle: 'Pro',
          planAmount: 149,
          status: 102,
          total_licences: 20,
          subscription_date: new Date().getTime() / 1000,
          subscription_start_date: new Date().getTime() / 1000,
          subscription_closed_date:
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() / 1000,
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
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/customers')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Organizations
      </button>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Loading organization data...
        </div>
      )}

      {/* Organization Detail */}
      {!loading && organization && <OrganizationDetail organization={organization} />}

      {/* Subscriptions Info */}
      {!loading && subscriptions.length > 0 && (
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Subscription Plans</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">{sub.title}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Amount: {sub.currency} {sub.amount}
                </p>
                <p className="text-sm text-gray-600">
                  Type: {sub.plan_type === 100 ? 'Monthly' : 'Yearly'}
                </p>
                <p className="text-sm text-gray-600">Customers: {sub.totalCustomers}</p>
                <p className="mt-2 text-sm text-gray-600">{sub.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      {!loading && (
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-700">📌 TODO</p>
          <ul className="mt-2 ml-5 list-disc text-sm text-blue-600">
            <li>
              Create endpoint:{' '}
              <code className="rounded bg-white px-2 py-1">GET /organisations/:id</code> to fetch
              real organization data
            </li>
            <li>This page currently shows mock data - update to use real API</li>
            <li>Check Network tab (F12) to see subscriptions API being called</li>
          </ul>
        </div>
      )}
    </div>
  );
}
