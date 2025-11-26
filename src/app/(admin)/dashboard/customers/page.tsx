// 
'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

// Dummy data – Replace with your API data
const initialOrganizations = [
  {
    name: 'Tech Innovations Inc',
    email: 'contact@techinnovations.com',
    active: 50,
    total: 40,
    subscription: 'Pro',
    onboardingDate: '15 Jan 2024, 10:30 AM',
    renewDate: '15 Jan 2025, 10:30 AM',
    status: 'Active',
  },
  {
    name: 'Global Solutions Ltd',
    email: 'info@globalsolutions.com',
    active: 30,
    total: 25,
    subscription: 'Basic',
    onboardingDate: '20 Nov 2023, 2:45 PM',
    renewDate: '20 Nov 2024, 2:45 PM',
    status: 'Active',
  },
  {
    name: 'Creative Studios',
    email: 'hello@creativestudios.com',
    active: 15,
    total: 10,
    subscription: 'Pro',
    onboardingDate: '10 Aug 2023, 9:15 AM',
    renewDate: '10 Aug 2024, 9:15 AM',
    status: 'Inactive',
  },
  {
    name: 'DataCore Systems',
    email: 'admin@datacore.com',
    active: 100,
    total: 85,
    subscription: 'Standard',
    onboardingDate: '05 Mar 2024, 11:20 AM',
    renewDate: '05 Mar 2025, 11:20 AM',
    status: 'Active',
  },
  {
    name: 'Marketing Masters',
    email: 'team@marketingmasters.com',
    active: 20,
    total: 18,
    subscription: 'Basic',
    onboardingDate: '28 Feb 2024, 4:00 PM',
    renewDate: '28 Feb 2025, 4:00 PM',
    status: 'Active',
  },
];

const subscriptionOptions = ['Pro', 'Basic', 'Standard'];

export default function CustomersPage() {
  const [organizations, setOrganizations] = useState(initialOrganizations);

  const handleSubscriptionChange = (idx: number, newPlan: string) => {
    const updated = [...organizations];
    updated[idx].subscription = newPlan;
    setOrganizations(updated);
  };

  const handleEdit = (idx: number) => {
    alert(`Edit organization: ${organizations[idx].name}`);
  };

  const handleDelete = (idx: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(orgs => orgs.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-500 mt-1">Manage all organizations and their members</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organisation Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active/Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Onboarding Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Renew Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((org, idx) => (
              <tr key={org.email} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{org.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{org.active}/{org.total}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={org.subscription}
                    onChange={e => handleSubscriptionChange(idx, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {subscriptionOptions.map(plan => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{org.onboardingDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{org.renewDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      org.status === 'Active'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
