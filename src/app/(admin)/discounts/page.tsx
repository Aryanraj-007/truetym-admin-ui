'use client';

import React, { useEffect, useState } from 'react';
import { Check, Plus, Search, Tag, Trash2, X } from 'lucide-react';

import {
  assignDiscountToOrgs,
  createDiscount,
  deactivateDiscount,
  listDiscounts,
  searchAssignableOrgs,
} from '@/lib/discount';

interface DiscountRow {
  id: string;
  code: string | null;
  title: string;
  discount_value: number;
  valid_from: number;
  valid_to: number | null;
  default_availment_months: number | null;
  applies_to_seat_additions: number;
  max_redemptions: number | null;
  redemption_count: number;
  is_active: number;
}

interface OrgResult {
  id: string;
  org_name: string;
}

const toEpoch = (d: string) => Math.floor(new Date(`${d}T00:00:00`).getTime() / 1000);
const fmtDate = (s: number | null) =>
  !s
    ? 'No expiry'
    : new Date(s * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

const asArray = <T,>(res: any): T[] => (Array.isArray(res) ? res : (res?.data ?? []));

export default function DiscountManagement() {
  const [rows, setRows] = useState<DiscountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [discountScope, setDiscountScope] = useState<'all' | 'auto_recurring' | 'manual_prorate'>(
    'all',
  );
  const [assignFor, setAssignFor] = useState<DiscountRow | null>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [availmentMonths, setAvailmentMonths] = useState('');
  const [seatAdd, setSeatAdd] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Assign-to-org state ────────────────────────────────
  const [orgSearch, setOrgSearch] = useState('');
  const [orgResults, setOrgResults] = useState<OrgResult[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  // Map<orgId, orgName> so picks survive across searches (results list changes).
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [assignMonths, setAssignMonths] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<{
    assigned: number;
    skipped: number;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await listDiscounts();
    setRows(asArray<DiscountRow>(res));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Reset the assign modal whenever it opens for a different discount.
  useEffect(() => {
    setSelected(new Map());
    setOrgSearch('');
    setAssignMonths('');
    setAssignError('');
    setAssignResult(null);
    setOrgResults([]);
  }, [assignFor?.id]);

  // Debounced org search while the assign modal is open.
  // Empty query returns the first page of orgs, so the list isn't blank on open.
  useEffect(() => {
    if (!assignFor) return;
    const handle = setTimeout(async () => {
      setOrgLoading(true);
      try {
        const res = await searchAssignableOrgs(orgSearch.trim());
        setOrgResults(asArray<OrgResult>(res));
      } catch {
        setAssignError('Failed to search organizations');
      } finally {
        setOrgLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [assignFor, orgSearch]);

  const reset = () => {
    setCode('');
    setTitle('');
    setDescription('');
    setDiscountValue('');
    setValidFrom('');
    setValidTo('');
    setAvailmentMonths('');
    setSeatAdd(false);
    setMaxRedemptions('');
    setDiscountScope('all');
    setError('');
  };

  const submit = async () => {
    if (!title.trim()) return setError('Title is required');
    const val = parseFloat(discountValue);
    if (!val || val <= 0 || val > 100) return setError('Discount must be 1–100%');
    if (!validFrom) return setError('Valid-from date is required');

    setSaving(true);
    setError('');
    try {
      const res = await createDiscount({
        code: code.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        discountValue: val,
        validFrom: toEpoch(validFrom),
        validTo: validTo ? toEpoch(validTo) : undefined,
        defaultAvailmentMonths: availmentMonths ? parseInt(availmentMonths, 10) : undefined,
        appliesToSeatAdditions: seatAdd,
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : undefined,
        discountScope,
      });
      if (res?.id || res?.succeeded) {
        setShowModal(false);
        reset();
        load();
      } else {
        setError(res?.message?.[0] ?? 'Failed to create discount');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // ── Assign helpers ─────────────────────────────────────
  const toggleOrg = (id: string, name: string) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, name);
      return next;
    });

  const removeSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

  const closeAssign = () => setAssignFor(null);

  const submitAssign = async () => {
    if (!assignFor) return;
    if (selected.size === 0) return setAssignError('Select at least one organization');

    setAssigning(true);
    setAssignError('');
    try {
      const res = await assignDiscountToOrgs({
        discountMasterId: assignFor.id,
        organisationIds: Array.from(selected.keys()),
        availmentMonths: assignMonths ? parseInt(assignMonths, 10) : undefined,
      });
      if (res?.succeeded) {
        setAssignResult({
          assigned: res.assigned ?? selected.size,
          skipped: Array.isArray(res.skipped) ? res.skipped.length : (res.skipped ?? 0),
        });
        load();
      } else {
        setAssignError(res?.message?.[0] ?? 'Failed to assign discount');
      }
    } catch {
      setAssignError('Something went wrong');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 bg-white p-10">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-black">Discounts & Referrals</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2 font-semibold text-white transition-all hover:bg-teal-600"
        >
          <Plus className="h-4 w-4" /> New discount
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No discounts created yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const capReached =
              r.max_redemptions !== null && r.redemption_count >= r.max_redemptions;
            return (
              <div
                key={r.id}
                className={`rounded-2xl border p-5 transition-all ${
                  r.is_active
                    ? 'border-teal-200 bg-teal-50/30'
                    : 'border-gray-200 bg-gray-50/50 opacity-70'
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-teal-600" />
                    <span className="text-lg font-bold text-black">{r.discount_value}% off</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await deactivateDiscount(r.id);
                      load();
                    }}
                    disabled={!r.is_active}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-30"
                    title="Deactivate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-black">{r.title}</p>
                {r.code && (
                  <span className="mt-1 inline-block rounded bg-gray-900 px-2 py-0.5 font-mono text-xs text-white">
                    {r.code}
                  </span>
                )}
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <p>
                    Valid: {fmtDate(r.valid_from)} → {fmtDate(r.valid_to)}
                  </p>
                  <p>
                    Availment:{' '}
                    {r.default_availment_months
                      ? `${r.default_availment_months} months`
                      : 'follows validity'}
                  </p>
                  <p>Seat additions: {r.applies_to_seat_additions ? 'Included' : 'Excluded'}</p>
                  <p>
                    Redeemed: {r.redemption_count}
                    {r.max_redemptions ? ` / ${r.max_redemptions}` : ' (unlimited)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignFor(r)}
                  disabled={!r.is_active || capReached}
                  className="mt-4 w-full rounded-md bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-40"
                  title={capReached ? 'Redemption limit reached' : undefined}
                >
                  {capReached ? 'Limit reached' : 'Assign to orgs'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create discount modal ───────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="max-h-[90vh] w-125 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">New discount / referral</h3>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            )}

            <Field label="Applicable to" required>
              <select
                value={discountScope}
                onChange={(e) => setDiscountScope(e.target.value as typeof discountScope)}
                className="input"
              >
                <option value="all">All charges (recurring + prorate/manual)</option>
                <option value="auto_recurring">Auto recurring only (Razorpay offer)</option>
                <option value="manual_prorate">Manual bills + prorate only</option>
              </select>
            </Field>

            <div className="space-y-4">
              <Field label="Referral code (optional)">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BIGTEAM20"
                  className="input"
                />
              </Field>
              <Field label="Title" required>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Volume discount — Pro"
                  className="input"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="input"
                />
              </Field>
              <Field label="Discount %" required>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="20"
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valid from" required>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Valid to (blank = no expiry)">
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Availment (months)">
                  <input
                    type="number"
                    min={1}
                    value={availmentMonths}
                    onChange={(e) => setAvailmentMonths(e.target.value)}
                    placeholder="e.g. 3"
                    className="input"
                  />
                </Field>
                <Field label="Max redemptions">
                  <input
                    type="number"
                    min={1}
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="unlimited"
                    className="input"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-black">
                <input
                  type="checkbox"
                  checked={seatAdd}
                  onChange={(e) => setSeatAdd(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600"
                />
                Apply discount to seats added later
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowModal(false);
                }}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create discount'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign-to-orgs modal (search + multi-select) ── */}
      {assignFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-150 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-black">Assign discount to organizations</h3>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-semibold text-teal-600">
                    {assignFor.discount_value}% off
                  </span>{' '}
                  · {assignFor.title}
                  {assignFor.code && (
                    <span className="ml-2 rounded bg-gray-900 px-2 py-0.5 font-mono text-xs text-white">
                      {assignFor.code}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAssign}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {assignResult ? (
              /* Success state */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                  <Check className="h-7 w-7 text-teal-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-black">
                    Assigned to {assignResult.assigned} organization
                    {assignResult.assigned === 1 ? '' : 's'}.
                  </p>
                  {assignResult.skipped > 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                      {assignResult.skipped} skipped (redemption limit reached).
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeAssign}
                  className="rounded-lg bg-teal-500 px-6 py-2.5 font-semibold text-white hover:bg-teal-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Controls */}
                <div className="space-y-3 p-6 pb-3">
                  {assignError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-semibold text-red-800">{assignError}</p>
                    </div>
                  )}

                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder="Search organizations by name…"
                      className="input !pl-9"
                    />
                  </div>

                  {/* Selected chips (persist across searches) */}
                  {selected.size > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selected.entries()).map(([id, name]) => (
                        <span
                          key={id}
                          className="flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => removeSelected(id)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results list */}
                <div className="min-h-40 flex-1 overflow-y-auto border-y border-gray-100 px-6 py-2">
                  {orgLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
                    </div>
                  ) : orgResults.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                      {orgSearch.trim() ? 'No organizations match.' : 'No organizations found.'}
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {orgResults.map((o) => (
                        <li key={o.id}>
                          <label className="flex cursor-pointer items-center gap-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={selected.has(o.id)}
                              onChange={() => toggleOrg(o.id, o.org_name)}
                              className="h-4 w-4 rounded border-gray-300 text-teal-600"
                            />
                            <span className="truncate text-sm font-semibold text-black">
                              {o.org_name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!orgSearch.trim() && orgResults.length >= 25 && (
                    <p className="py-2 text-center text-xs text-gray-400">
                      Showing first 25 — type to narrow the list.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="space-y-4 p-6">
                  <Field label="Availment override (months)">
                    <input
                      type="number"
                      min={1}
                      value={assignMonths}
                      onChange={(e) => setAssignMonths(e.target.value)}
                      placeholder={
                        assignFor.default_availment_months
                          ? `default: ${assignFor.default_availment_months}`
                          : 'follows validity'
                      }
                      className="input"
                    />
                  </Field>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{selected.size} selected</span>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={closeAssign}
                        disabled={assigning}
                        className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitAssign}
                        disabled={assigning || selected.size === 0}
                        className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
                      >
                        {assigning
                          ? 'Assigning…'
                          : `Assign${selected.size ? ` ${selected.size}` : ''}`}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: Readonly<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
