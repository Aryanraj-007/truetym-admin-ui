'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import OrganizationDetail from '@/components/common/admin-panel/OrganizationDetail';

export default function OrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.organizationId as string;

  // Mock data - replace with actual data fetching
  const organizationData = {
    'tech-innovations-inc': {
      name: 'Tech Innovations Inc',
      email: 'contact@techinnovations.com',
      status: 'Active',
      role: 'Enterprise Client',
      employees: [
        {
          id: '1',
          name: 'Ben Thompson',
          email: 'benthompson@gmail.com',
          role: 'Time Tracking',
          status: 'Active',
          avatar: 'B'
        },
        {
          id: '2',
          name: 'Jason Young',
          email: 'jason.young@yamshoe.com',
          role: 'Company Admin',
          status: 'Active',
          avatar: 'J'
        },
        {
          id: '3',
          name: 'Josephine Owen',
          email: 'jowen@zstfly.com',
          role: 'Custom Access',
          status: 'Invited',
          avatar: 'J'
        },
        {
          id: '4',
          name: 'Karina Lau',
          email: 'karinalau@yahoo.com',
          role: 'Time Tracking',
          status: 'Active',
          avatar: 'K'
        }
      ]
    },
    // Add other organizations data as needed
  };

  const organization = organizationData[organizationId as keyof typeof organizationData];

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/dashboard/customers')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organizations
      </button>

      {/* Organization Detail */}
      <OrganizationDetail organization={organization} />
    </div>
  );
}

