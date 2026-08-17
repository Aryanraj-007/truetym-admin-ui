'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import { assignDiscount, searchAssignableOrgs } from '@/lib/discount';

interface Org {
  id: string;
  org_name: string;
}

export default function AssignDiscountModal({
  discount,
  onClose,
  onAssigned,
}: Readonly<{
  discount: {
    id: string;
    title: string;
    discount_value: number;
    default_availment_months: number | null;
  };
  onClose: () => void;
  onAssigned: () => void;
}>) {
  const [query, setQuery] = useState('');
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [availmentMonths, setAvailmentMonths] = useState(
    discount.default_availment_months ? String(discount.default_availment_months) : '',
  );
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debounced org search
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAssignableOrgs(query);
        setOrgs(res?.data ?? res ?? []);
      } catch {
        setOrgs([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const submit = async () => {
    if (!selectedOrg) return setError('Select an organisation');
    setAssigning(true);
    setError('');
    try {
      const res = await assignDiscount({
        discountMasterId: discount.id,
        organisationId: selectedOrg.id,
        availmentMonths: availmentMonths ? parseInt(availmentMonths, 10) : undefined,
      });
      if (res?.id || res?.succeeded) {
        setSuccess(`${discount.discount_value}% discount assigned to ${selectedOrg.org_name}`);
        onAssigned();
        setTimeout(onClose, 1500);
      } else {
        setError(res?.message?.[0] ?? 'Failed to assign');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="w-125 rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-black">Assign discount</h3>
            <p className="text-sm text-gray-500">
              {discount.title} · {discount.discount_value}% off
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-semibold text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-semibold text-black">Organisation</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={selectedOrg ? selectedOrg.org_name : query}
                onChange={(e) => {
                  setSelectedOrg(null);
                  setQuery(e.target.value);
                }}
                placeholder="Search organisation by name…"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-9 font-medium text-black focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
              />
            </div>

            {!selectedOrg && query && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                {loading ? (
                  <div className="p-3 text-sm text-gray-400">Searching…</div>
                ) : orgs.length === 0 ? (
                  <div className="p-3 text-sm text-gray-400">No organisations found</div>
                ) : (
                  orgs.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedOrg(o);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-black hover:bg-teal-50"
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {o.org_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="period" className="mb-2 block font-semibold text-black">
              Availment period (months)
            </label>
            <input
              type="number"
              min={1}
              value={availmentMonths}
              onChange={(e) => setAvailmentMonths(e.target.value)}
              placeholder="Blank = follows coupon validity"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-black focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              How long this org keeps the discount. After it expires, renewals charge full price.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={assigning}
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={assigning || !selectedOrg}
            className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {assigning ? 'Assigning…' : 'Assign discount'}
          </button>
        </div>
      </div>
    </div>
  );
}
