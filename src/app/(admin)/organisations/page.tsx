'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RazorPaySubscriptionStatusEnum, RZP_STATUS_LABEL } from '@/constants/subscription';
import { selectIsSuperAdmin } from '@/store/slices/authSlice';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Fingerprint,
  MinusCircle,
  MoreHorizontal,
  Pause,
  PauseCircle,
  RefreshCw,
  Search,
  Trash2,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import { Organization } from '@/types/organisation';
import {
  ExtendPayload,
  extendSubscription,
  extendTrial,
  fetchOrganizations,
  updateSubscriptionMode,
} from '@/lib/organisation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUBSCRIPTION_PLANS = ['Basic', 'Core', 'Pro'];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'authenticated', label: 'Card Verified' },
  { value: 'pending', label: 'Pending Payment' },
  { value: 'halted', label: 'Halted' },
  { value: 'paused', label: 'Paused' },
  { value: 'pending_cancel', label: 'Pending Cancel' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
];

// Max page buttons shown in pagination (excluding prev/next)
const MAX_PAGE_BUTTONS = 7;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrgStatus =
  | 'active'
  | 'trial'
  | 'expired'
  | 'inactive'
  | 'authenticated'
  | 'created'
  | 'pending'
  | 'halted'
  | 'paused'
  | 'pending_cancel'
  | 'scheduled';

interface NextPlan {
  planTitle: string | undefined;
  planAmount: number;
  effectiveAt: number;
}

interface OrgRow extends Organization {
  org_status: OrgStatus;
  /**
   * sub_status is the raw RZP numeric code.
   * null means no Razorpay subscription exists (manual / trial-only).
   */
  sub_status: number | null;
  subscription_type?: number;
  is_free_trial: number;
  razorpay_subscription_id: string | undefined;
  planTitle: string | undefined;
  planAmount: number;
  total_licences: number;
  current_start: number;
  current_end: number;
  trial_end_at?: string | null;
  subscription_start_date: number;
  subscription_closed_date: number;
  subscription_mode: 'auto' | 'manual';
  nextPlan: NextPlan | null;
  pricing: { userCount: number; monthlyCost: number; yearlyCost: number };
  isSeatAvailable: boolean;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (value?: number | null): string => {
  const s = Number(value);
  if (!Number.isFinite(s) || s <= 0) return '—';
  const d = new Date(s * 1000);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtCurrency = (amount: number, cycle: number | null): string => {
  if (!amount) return '—';
  const suffix = cycle === 100 ? '/mo' : cycle === 101 ? '/yr' : '';
  return `₹${amount.toLocaleString('en-IN')}${suffix}`;
};

const truncate = (name?: string, max = 24) =>
  !name ? '—' : name.length > max ? `${name.slice(0, max)}…` : name;

/** Which timestamps drive the Period start/end columns */
const periodDates = (org: OrgRow) => {
  if (org.org_status === 'trial' || org.org_status === 'authenticated') {
    return { start: org.created_at, end: org.trial_end_at };
  }
  return { start: org.current_start, end: org.current_end };
};

// ---------------------------------------------------------------------------
// resolveOrgState — reads authoritative fields from backend response
// ---------------------------------------------------------------------------
function resolveOrgState(org: OrgRow) {
  const orgStatus = (org.org_status ?? 'inactive') as OrgStatus;

  // sub_status is the raw RZP numeric code (null = no RZP sub)
  const rzpStatus: number | null =
    org.sub_status !== null && org.sub_status !== undefined ? Number(org.sub_status) : null;

  const isFreeTrial = org.is_free_trial === 1 || (org.is_free_trial as any) === true;
  const hasRzp = rzpStatus !== null;
  const hasNextPlan = !!org.nextPlan?.planTitle;

  // ---- Mode-switch guard rules ----
  //
  // Switch to MANUAL is only allowed when:
  //   1. Status is 'trial' AND sub_status is null (pure free trial, no RZP sub), OR
  //   2. Status is 'expired'
  //
  // Switch to AUTO is only allowed when:
  //   sub_status is null (no Razorpay subscription linked)
  const canSwitchToManual =
    (orgStatus === 'trial' && rzpStatus === null) || orgStatus === 'expired';

  const canSwitchToAuto = rzpStatus === null;

  const currentMode = (org.subscription_mode ?? 'auto') as 'auto' | 'manual';
  const canToggleMode = currentMode === 'auto' ? canSwitchToManual : canSwitchToAuto;

  return {
    orgStatus,
    rzpStatus,
    isFreeTrial,
    hasRzp,
    hasNextPlan,
    currentMode,
    canToggleMode,

    // Action gates
    canExtendTrial: orgStatus === 'trial' || orgStatus === 'authenticated',
    // Allow extend subscription for active, pending_cancel, AND expired
    canExtendSubscription:
      orgStatus === 'active' || orgStatus === 'pending_cancel' || orgStatus === 'inactive',
    showRzpBadge: hasRzp,
  };
}

// ---------------------------------------------------------------------------
// STATUS_META — visual config for every possible org_status
// ---------------------------------------------------------------------------
const STATUS_META: Record<
  OrgStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: 'Active',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  trial: {
    label: 'Trial',
    icon: Clock3,
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  },
  authenticated: {
    label: 'Card Verified',
    icon: Fingerprint,
    className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20',
  },
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-500/20',
  },
  halted: {
    label: 'Halted',
    icon: AlertCircle,
    className: 'bg-red-50 text-red-700 ring-1 ring-red-500/20',
  },
  paused: {
    label: 'Paused',
    icon: PauseCircle,
    className: 'bg-slate-50 text-slate-600 ring-1 ring-slate-400/20',
  },
  pending_cancel: {
    label: 'Cancelling',
    icon: Clock3,
    className: 'bg-orange-50 text-orange-600 ring-1 ring-orange-400/20',
  },
  scheduled: {
    label: 'Scheduled',
    icon: CalendarCheck,
    className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-500/20',
  },
  created: {
    label: 'Created',
    icon: Clock3,
    className: 'bg-gray-50 text-gray-500 ring-1 ring-gray-300/50',
  },
  expired: {
    label: 'Expired',
    icon: MinusCircle,
    className: 'bg-red-50 text-red-600 ring-1 ring-red-500/20',
  },
  inactive: {
    label: 'Inactive',
    icon: MinusCircle,
    className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20',
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: Readonly<{ status: OrgStatus }>) {
  const meta = STATUS_META[status] ?? STATUS_META.inactive;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function ModeBadge({ mode }: Readonly<{ mode: 'auto' | 'manual' }>) {
  const isAuto = mode === 'auto';
  return (
    <span
      title={isAuto ? 'Razorpay auto-billing' : 'Prepaid / manual invoice'}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
        isAuto
          ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20'
          : 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
      }`}
    >
      {isAuto ? <Zap className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
      {isAuto ? 'Auto' : 'Manual'}
    </span>
  );
}

/** Raw RZP status shown as a small secondary badge */
function RzpBadge({ status }: Readonly<{ status: number }>) {
  const label = RZP_STATUS_LABEL[status] ?? `RZP ${status}`;
  const warnStates = [
    RazorPaySubscriptionStatusEnum.pending,
    RazorPaySubscriptionStatusEnum.halted,
    RazorPaySubscriptionStatusEnum.failed,
    RazorPaySubscriptionStatusEnum.pending_cancel,
    RazorPaySubscriptionStatusEnum.authenticated,
  ];
  const isWarn = warnStates.includes(status);
  return (
    <span
      title={`Razorpay: ${label}`}
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
        isWarn
          ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-400/30'
          : 'bg-gray-50 text-gray-500 ring-1 ring-gray-300/50'
      }`}
    >
      RZP: {label}
    </span>
  );
}

/** Shows the upcoming plan that will take effect at period end */
function NextPlanPill({ next }: Readonly<{ next: NextPlan }>) {
  return (
    <span
      title={`Switches to ${next.planTitle} on ${fmtDate(next.effectiveAt)}`}
      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-400/20"
    >
      <ArrowRight className="h-2.5 w-2.5" />
      {next.planTitle}
    </span>
  );
}

function SubscriptionDetail({ org }: Readonly<{ org: OrgRow }>) {
  const cycleLabel =
    org.subscription_type === 100 ? 'Monthly' : org.subscription_type === 101 ? 'Yearly' : null;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-gray-900">{org.planTitle || '—'}</span>
        {cycleLabel && (
          <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px] text-gray-500">
            {cycleLabel}
          </span>
        )}
        {org.planAmount > 0 && (
          <span className="text-xs text-gray-500">
            {fmtCurrency(org.planAmount, org?.subscription_type ?? 100)}
          </span>
        )}
      </div>
      {org.nextPlan?.planTitle && (
        <div className="flex items-center gap-1 text-[11px] text-indigo-600">
          <ArrowRight className="h-2.5 w-2.5" />
          Next: {org.nextPlan.planTitle}
          {org.nextPlan.effectiveAt > 0 && (
            <span className="text-gray-400">· {fmtDate(org.nextPlan.effectiveAt)}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExtendDialog
// ---------------------------------------------------------------------------

interface ExtendState {
  org: OrgRow | null;
  kind: 'trial' | 'subscription';
}

function ExtendDialog({
  state,
  onClose,
  onSubmit,
  submitting,
}: Readonly<{
  state: ExtendState;
  onClose: () => void;
  onSubmit: (payload: ExtendPayload) => void;
  submitting: boolean;
}>) {
  const [mode, setMode] = useState<'days' | 'date'>('days');
  const [days, setDays] = useState<number>(15);
  const [date, setDate] = useState<string>('');

  const open = !!state.org;
  const isTrial = state.kind === 'trial';
  const currentEnd = state.org ? (isTrial ? state.org.trial_end_at : state.org.current_end) : 0;

  const handleSubmit = () => {
    if (mode === 'date') {
      if (!date) return;
      onSubmit({ newDate: Math.floor(new Date(`${date}T23:59:59`).getTime() / 1000) });
    } else {
      onSubmit({ days: Number(days) || 0 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: any) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend {isTrial ? 'trial' : 'subscription'}</DialogTitle>
          <DialogDescription>
            {state.org?.org_name} · current end{' '}
            <span className="font-medium text-gray-900">{fmtDate(Number(currentEnd))}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="inline-flex rounded-md border p-0.5">
            {(['days', 'date'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  mode === m ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {m === 'days' ? 'Add days' : 'Pick date'}
              </button>
            ))}
          </div>

          {mode === 'days' ? (
            <div className="space-y-2">
              <Label>Days to add</Label>
              <div className="flex gap-2">
                {[7, 15, 30, 90].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={days === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDays(d)}
                  >
                    +{d}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Added on top of the later of current end / today.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>New end date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Pagination — numbered buttons with ellipsis + direct jump
// ---------------------------------------------------------------------------

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function Pagination({
  pageNumber,
  totalPages,
  pageSize,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
}: Readonly<PaginationProps>) {
  /**
   * Build the array of page numbers / ellipsis markers to render.
   * Always shows first, last, current ± 2, with '…' gaps between.
   */
  const buildPageList = (): (number | '...')[] => {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2; // pages shown either side of current
    const left = pageNumber - delta;
    const right = pageNumber + delta;

    const pages: (number | '...')[] = [];

    // always include page 1
    pages.push(1);

    if (left > 2) pages.push('...');

    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push('...');

    // always include last page
    pages.push(totalPages);

    return pages;
  };

  const pageList = buildPageList();

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 text-sm text-gray-600">
      {/* Left: row count info */}
      <span className="text-xs text-gray-500">
        Showing{' '}
        <span className="font-medium text-gray-700">
          {startItem}–{endItem}
        </span>{' '}
        of <span className="font-medium text-gray-700">{totalItems}</span> organizations
      </span>

      {/* Right: rows-per-page + page buttons */}
      <div className="flex items-center gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Rows:</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page buttons */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Prev */}
          <button
            type="button"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageList.map((page, idx) =>
            page === '...' ? (
              // Ellipsis — not clickable
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={page === pageNumber ? 'page' : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors ${
                  page === pageNumber
                    ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {page}
              </button>
            ),
          )}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrgTableRow — isolated row component
// ---------------------------------------------------------------------------

interface OrgTableRowProps {
  org: OrgRow;
  onExtend: (org: OrgRow, kind: 'trial' | 'subscription') => void;
  onToggleMode: (org: OrgRow) => void;
  modePending: boolean;
  isSuperAdmin: boolean;
  router: ReturnType<typeof useRouter>;
}

function OrgTableRow({
  org,
  onExtend,
  onToggleMode,
  modePending,
  isSuperAdmin,
  router,
}: Readonly<OrgTableRowProps>) {
  const state = resolveOrgState(org);
  const { start, end } = periodDates(org);
  const mode = state.currentMode;
  const seats = org.total_licences > 0 ? org.total_licences : '—';

  return (
    <TableRow className="hover:bg-gray-50/50">
      {/* Organization */}
      <TableCell>
        <button
          type="button"
          title={org.org_name}
          onClick={() => router.push(`/client-details/employees?id=${org.id}`)}
          className="text-left text-sm font-semibold text-gray-900 hover:text-teal-600"
        >
          {truncate(org.org_name)}
        </button>
        {org.website && (
          <div className="max-w-44 truncate text-xs text-gray-400">{org.website}</div>
        )}
      </TableCell>

      {/* Subscription — plan + cycle + amount + next plan */}
      <TableCell>
        <SubscriptionDetail org={org} />
      </TableCell>

      {/* Billing mode */}
      <TableCell>
        <ModeBadge mode={mode} />
      </TableCell>

      {/* Seats used / licensed */}
      <TableCell className="text-sm text-gray-700">
        {org.pricing?.userCount ?? 0}
        <span className="text-gray-400">/{seats}</span>
      </TableCell>

      {/* Period start */}
      <TableCell className="text-sm text-gray-600">{fmtDate(Number(start))}</TableCell>

      {/* Period end */}
      <TableCell className="text-sm text-gray-600">{fmtDate(Number(end))}</TableCell>

      {/* Status column — primary badge + RZP sub-badge + next-plan pill */}
      <TableCell>
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge status={state.orgStatus} />
          {state.showRzpBadge && typeof state.rzpStatus === 'number' && (
            <RzpBadge status={state.rzpStatus} />
          )}
          {state.hasNextPlan && org.nextPlan && <NextPlanPill next={org.nextPlan} />}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Manage</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.push(`/client-details/employees?id=${org.id}`)}>
              <Users className="mr-2 h-4 w-4" />
              View employees
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Extend trial — only for trial / authenticated */}
            {state.canExtendTrial && (
              <DropdownMenuItem onClick={() => onExtend(org, 'trial')}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Extend trial
              </DropdownMenuItem>
            )}

            {/* Extend subscription — active, pending_cancel, OR expired */}
            {state.canExtendSubscription && (
              <DropdownMenuItem onClick={() => onExtend(org, 'subscription')}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Extend subscription
              </DropdownMenuItem>
            )}

            {/* RZP-status-specific actions */}
            {typeof state.rzpStatus === 'number' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-gray-400">
                  Razorpay: {RZP_STATUS_LABEL[state.rzpStatus] ?? state.rzpStatus}
                </DropdownMenuLabel>

                {/* authenticated — card linked, not yet charged */}
                {state.rzpStatus === RazorPaySubscriptionStatusEnum.authenticated && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/client-details/billing?id=${org.id}`)}
                  >
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Card verified — awaiting charge
                  </DropdownMenuItem>
                )}

                {/* pending / failed — payment retry */}
                {[
                  RazorPaySubscriptionStatusEnum.pending,
                  RazorPaySubscriptionStatusEnum.failed,
                ].includes(state.rzpStatus) && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/client-details/billing?id=${org.id}`)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Review payment
                  </DropdownMenuItem>
                )}

                {/* halted — too many retries */}
                {state.rzpStatus === RazorPaySubscriptionStatusEnum.halted && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/client-details/billing?id=${org.id}`)}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Review halted billing
                  </DropdownMenuItem>
                )}

                {/* paused */}
                {state.rzpStatus === RazorPaySubscriptionStatusEnum.paused && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/client-details/billing?id=${org.id}`)}
                  >
                    <PauseCircle className="mr-2 h-4 w-4" />
                    View paused subscription
                  </DropdownMenuItem>
                )}

                {/* pending_cancel / scheduled — change queued */}
                {[
                  RazorPaySubscriptionStatusEnum.pending_cancel,
                  RazorPaySubscriptionStatusEnum.scheduled,
                ].includes(state.rzpStatus) && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/client-details/billing?id=${org.id}`)}
                  >
                    <Clock3 className="mr-2 h-4 w-4" />
                    View scheduled change
                  </DropdownMenuItem>
                )}

                {/* cancelled — no further action */}
                {state.rzpStatus === RazorPaySubscriptionStatusEnum.cancelled && (
                  <DropdownMenuItem disabled>
                    <XCircle className="mr-2 h-4 w-4" />
                    Subscription cancelled
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuSeparator />

            {/* Toggle billing mode — only shown when the switch is permitted */}
            {state.canToggleMode ? (
              <DropdownMenuItem disabled={modePending} onClick={() => onToggleMode(org)}>
                {mode === 'auto' ? (
                  <CreditCard className="mr-2 h-4 w-4" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Switch to {mode === 'auto' ? 'manual' : 'auto'}
              </DropdownMenuItem>
            ) : (
              /* Greyed-out hint explaining why the switch is unavailable */
              <DropdownMenuItem disabled className="cursor-not-allowed">
                {mode === 'auto' ? (
                  <CreditCard className="mr-2 h-4 w-4 opacity-40" />
                ) : (
                  <Zap className="mr-2 h-4 w-4 opacity-40" />
                )}
                <span className="opacity-50">
                  Switch to {mode === 'auto' ? 'manual' : 'auto'} (unavailable)
                </span>
              </DropdownMenuItem>
            )}

            {/* Super-admin: delete */}
            {isSuperAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                  onClick={() => router.push(`/offboarding?org_id=${org.id}`)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete organisation
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// FilterBar — search + plan + status selects
// ---------------------------------------------------------------------------

interface FilterBarProps {
  filters: { name: string; subscriptionPlan: string; trialStatus: string };
  isFetching: boolean;
  onFilter: (key: 'name' | 'subscriptionPlan' | 'trialStatus', value: string) => void;
}

function FilterBar({ filters, isFetching, onFilter }: Readonly<FilterBarProps>) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search organization…"
          value={filters.name}
          onChange={(e) => onFilter('name', e.target.value)}
          className="w-64 pl-8"
        />
      </div>

      <Select
        value={filters.subscriptionPlan || 'all'}
        onValueChange={(v) => onFilter('subscriptionPlan', v === 'all' ? '' : v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Plans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SelectItem key={plan} value={plan}>
              {plan}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.trialStatus} onValueChange={(v) => onFilter('trialStatus', v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFetching && <span className="ml-1 text-xs text-gray-400">Refreshing…</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrganisationPage
// ---------------------------------------------------------------------------

export default function OrganisationPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    name: '',
    subscriptionPlan: '',
    trialStatus: 'all',
  });
  const [extendState, setExtendState] = useState<ExtendState>({ org: null, kind: 'trial' });

  const queryKey = ['organizations', pageNumber, pageSize, filters] as const;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await fetchOrganizations(
        pageNumber,
        pageSize,
        filters.name,
        filters.subscriptionPlan === '' ? '' : filters.subscriptionPlan,
        filters.trialStatus === 'all' ? '' : filters.trialStatus,
        'created_at',
        'ASC',
      );
      if (!res.succeeded && res.totalItems > 0) {
        throw new Error(res.message?.join(', ') || 'API error');
      }
      return {
        list: (res.data ?? []) as unknown as OrgRow[],
        totalItems: res.totalItems ?? 0,
      };
    },
  });

  const organizations = data?.list ?? [];
  const totalItems = data?.totalItems ?? 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['organizations'] });

  const extendMut = useMutation({
    mutationFn: ({
      id,
      kind,
      payload,
    }: {
      id: string;
      kind: 'trial' | 'subscription';
      payload: ExtendPayload;
    }) => (kind === 'trial' ? extendTrial(id, payload) : extendSubscription(id, payload)),
    onSuccess: () => {
      setExtendState({ org: null, kind: 'trial' });
      invalidate();
    },
  });

  const modeMut = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: 'auto' | 'manual' }) =>
      updateSubscriptionMode(id, mode),
    onSuccess: invalidate,
  });

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPageNumber(1);
  };

  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading organizations</p>
          <p className="text-sm">{(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-full flex-col overflow-hidden p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500">Manage subscriptions, trials and billing mode</p>
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <FilterBar filters={filters} isFetching={isFetching} onFilter={setFilter} />
      </div>

      {/* Table — scrollable fixed-height container */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
        {/* Vertical scroll is on this inner div; the outer keeps the border/shadow */}
        <div className="h-full overflow-auto">
          <Table>
            {/* Sticky header stays visible while scrolling */}
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gray-50/90 backdrop-blur-sm hover:bg-gray-50/90">
                <TableHead className="min-w-44">Organization</TableHead>
                <TableHead className="min-w-40">Subscription</TableHead>
                <TableHead className="min-w-20">Mode</TableHead>
                <TableHead className="min-w-20">Seats</TableHead>
                <TableHead className="min-w-24">Start</TableHead>
                <TableHead className="min-w-24">End</TableHead>
                <TableHead className="min-w-40">Status</TableHead>
                <TableHead className="min-w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-300" />
                      <span className="text-sm">Loading organizations…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="h-5 w-5 text-gray-300" />
                      <span className="text-sm font-medium text-gray-500">
                        No organizations match the current filters
                      </span>
                      <span className="text-xs">Try adjusting your search or status filter</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <OrgTableRow
                    key={org.id}
                    org={org}
                    onExtend={(o, kind) => setExtendState({ org: o, kind })}
                    onToggleMode={(o) => {
                      const st = resolveOrgState(o);
                      modeMut.mutate({
                        id: o.id,
                        mode: st.currentMode === 'auto' ? 'manual' : 'auto',
                      });
                    }}
                    modePending={modeMut.isPending}
                    isSuperAdmin={isSuperAdmin}
                    router={router}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="shrink-0">
          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setPageNumber}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
          />
        </div>
      )}

      {/* Extend dialog */}
      <ExtendDialog
        state={extendState}
        submitting={extendMut.isPending}
        onClose={() => setExtendState({ org: null, kind: 'trial' })}
        onSubmit={(payload) =>
          extendState.org &&
          extendMut.mutate({ id: extendState.org.id, kind: extendState.kind, payload })
        }
      />
    </div>
  );
}
