'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import {
  getUserStatusBadgeClass,
  getUserStatusLabel,
  isOffboardableEmployee,
} from '@/lib/employee';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: number; // UserStatusEnum: 100 InvitationSent, 101 Registered, 102 XEmployee
  is_active?: number;
  deleted?: number;
  profile_image?: string;
  avatar: string;
}

interface OrganizationDetailProps {
  organization: {
    name: string;
    email: string;
    status?: string;
    role?: string;
    subscription_start_date?: string;
    subscription_closed_date?: string;
    employees: Employee[];
  };
}

const avatarColors = ['bg-cyan-400', 'bg-cyan-300', 'bg-cyan-500', 'bg-teal-400', 'bg-sky-400'];
const colorFor = (seed: string) =>
  avatarColors[seed.charCodeAt(0) % avatarColors.length] ?? 'bg-gray-400';

export default function OrganizationDetail({ organization }: Readonly<OrganizationDetailProps>) {
  const router = useRouter();

  const handleOffboard = (emp: Employee) => {
    router.push(`/offboarding/${emp.id}?type=user`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm text-gray-600">{organization.email}</span>

            {organization.status && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  organization.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {organization.status}
              </span>
            )}

            {organization.role && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {organization.role}
              </span>
            )}
          </div>
        </div>

        <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600">
          Add Employee
        </button>
      </div>

      {/* Employees */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Employees</h2>
          <p className="text-sm text-gray-500">{organization.employees.length} team members</p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
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
            {organization.employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              organization.employees.map((emp) => {
                const offboardable = isOffboardableEmployee(emp.status);
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {emp.profile_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={emp.profile_image}
                            alt={emp.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${colorFor(
                              emp.avatar || emp.name || '?',
                            )}`}
                          >
                            {emp.avatar}
                          </div>
                        )}
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">{emp.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.role || '-'}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getUserStatusBadgeClass(
                          emp.status,
                        )}`}
                      >
                        {getUserStatusLabel(emp.status)}
                      </span>
                    </td>

                    {/* Offboard icon — only for Invitation Sent (100) and Ex-Employee (102) */}
                    <td className="px-6 py-4">
                      {offboardable ? (
                        <button
                          onClick={() => handleOffboard(emp)}
                          title="Offboard (permanent delete)"
                          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span
                          title="Only invitation-sent or ex-employees can be offboarded"
                          className="text-xs text-gray-300"
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
