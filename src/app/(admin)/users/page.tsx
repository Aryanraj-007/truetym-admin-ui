'use client';

import { useEffect, useState } from 'react';

import { assignRole, getPendingSignups } from '@/lib/login';

interface PendingUser {
  id: string;
  name: string;
  dial_code: string;
  phone_number: string;
  created_at: number;
}

const ROLE_OPTIONS = [
  'super_admin',
  'admin',
  'sale_executive',
  'sale',
  'operation_head',
  'view_only',
];

export default function RoleManagementPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    setError(null);

    const result = await getPendingSignups();

    if (result.succeeded) {
      setPendingUsers(result.data || []);
    } else {
      setError(result.message?.[0] || 'Failed to load pending signups');
    }

    setLoading(false);
  };

  const handleAssign = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) {
      setError('Please select a role first');
      return;
    }

    setAssigningId(userId);
    setError(null);

    const result = await assignRole({ userId, role });

    if (result.succeeded) {
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      setError(result.message?.[0] || 'Failed to assign role');
    }

    setAssigningId(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Pending admin signups</h1>
      <p className="mb-6 text-sm text-gray-600">
        Assign a role to activate an account. Until then, they can&apos;t log in.
      </p>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : pendingUsers.length === 0 ? (
        <p className="text-sm text-gray-500">No pending signups.</p>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.dial_code} {user.phone_number}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRoles[user.id] || ''}
                  onChange={(e) =>
                    setSelectedRoles((prev) => ({ ...prev, [user.id]: e.target.value }))
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssign(user.id)}
                  disabled={assigningId === user.id}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {assigningId === user.id ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
