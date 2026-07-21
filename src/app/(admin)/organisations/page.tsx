'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  MinusCircle,
  MoreHorizontal,
  Search,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

import { Organization } from '@/types/organisation';
import { fetchOrganizations } from '@/lib/api';
import {
  ExtendPayload,
  extendSubscription,
  extendTrial,
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

/* ------------------------------------------------------------------ helpers */

const subscriptionOptions = ['Pro', 'Basic', 'Standard', 'Core'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
];

type OrgStatus = 'active' | 'trial' | 'expired' | 'inactive';

const fmtDate = (value?: number | null): string => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const truncate = (name?: string, max = 22) =>
  !name ? '—' : name.length > max ? `${name.slice(0, max)}…` : name;

/* Trial rows show created_at → trial_end_at; paid rows show current_start → current_end. */
const periodDates = (org: Organization & Record<string, any>) => {
  if (org.org_status === 'trial') {
    return { start: org.created_at, end: org.trial_end_at, isTrial: true };
  }
  return { start: org.current_start, end: org.current_end, isTrial: false };
};

/* ------------------------------------------------------------- status badge */

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
  expired: {
    label: 'Expired',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  },
  inactive: {
    label: 'Inactive',
    icon: MinusCircle,
    className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',
  },
};

function StatusBadge({ status }: Readonly<{ status: OrgStatus }>) {
  const meta = STATUS_META[status] ?? STATUS_META.inactive;
  const Icon = meta.icon;
  return (
    <span
      title={meta.label}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function ModeBadge({ mode }: Readonly<{ mode: 'auto' | 'manual' }>) {
  const isAuto = mode === 'auto';
  return (
    <span
      title={isAuto ? 'Razorpay auto-billing' : 'Prepaid / manual invoice'}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
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

/* ------------------------------------------------------------- extend modal */

interface ExtendState {
  org: (Organization & Record<string, any>) | null;
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
      const epoch = Math.floor(new Date(`${date}T23:59:59`).getTime() / 1000);
      onSubmit({ newDate: epoch });
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
            <span className="font-medium text-gray-900">{fmtDate(currentEnd)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="inline-flex rounded-md border p-0.5">
            <button
              type="button"
              onClick={() => setMode('days')}
              className={`rounded px-3 py-1 text-sm ${
                mode === 'days' ? 'bg-gray-900 text-white' : 'text-gray-600'
              }`}
            >
              Add days
            </button>
            <button
              type="button"
              onClick={() => setMode('date')}
              className={`rounded px-3 py-1 text-sm ${
                mode === 'date' ? 'bg-gray-900 text-white' : 'text-gray-600'
              }`}
            >
              Pick date
            </button>
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

/* --------------------------------------------------------------------- page */

export default function OrganisationPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    name: '',
    subscriptionPlan: '',
    trialStatus: 'all',
  });

  const [extendState, setExtendState] = useState<ExtendState>({
    org: null,
    kind: 'trial',
  });

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
        throw new Error(res.message?.join(', ') || 'API Error');
      }
      return {
        list: (res.data ?? []) as (Organization & Record<string, any>)[],
        totalItems: res.totalItems ?? 0,
      };
    },
  });

  const organizations = data?.list ?? [];
  const totalItems = data?.totalItems ?? 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['organizations'] });

  const extendMut = useMutation({
    mutationFn: async ({
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
    <div className="flex min-h-screen max-w-full flex-col overflow-x-hidden p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500">Manage subscriptions, trials and billing mode</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search organization…"
            value={filters.name}
            onChange={(e) => setFilter('name', e.target.value)}
            className="w-64 pl-8"
          />
        </div>

        <Select
          value={filters.subscriptionPlan || 'all'}
          onValueChange={(v: any) => setFilter('subscriptionPlan', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {subscriptionOptions.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.trialStatus} onValueChange={(v: any) => setFilter('trialStatus', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFetching && <span className="ml-1 text-xs text-gray-400">Refreshing…</span>}
      </div>

      {/* Table */}
      <div className="grow overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Period start</TableHead>
              <TableHead>Period end</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                  Loading organizations…
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                  No record found.
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org: any) => {
                const status = (org.org_status ?? 'inactive') as OrgStatus;
                const { start, end } = periodDates(org);
                const mode = (org.subscription_mode ?? 'auto') as 'auto' | 'manual';
                const seats =
                  org.total_licences && org.total_licences > 0 ? org.total_licences : 10;

                return (
                  <TableRow key={org.id} className="hover:bg-gray-50/60">
                    <TableCell>
                      <button
                        title={org.org_name}
                        onClick={() => router.push(`/client-details/employees?id=${org.id}`)}
                        className="text-left text-sm font-semibold text-gray-900 hover:text-teal-600"
                      >
                        {truncate(org.org_name)}
                      </button>
                      {org.website && <div className="text-xs text-gray-400">{org.website}</div>}
                    </TableCell>

                    <TableCell className="text-sm text-gray-700">{org.planTitle || '—'}</TableCell>

                    <TableCell>
                      <ModeBadge mode={mode} />
                    </TableCell>

                    <TableCell className="text-sm text-gray-700">
                      {org.pricing?.userCount ?? 0}/{seats}
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">{fmtDate(start)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{fmtDate(end)}</TableCell>

                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/client-details/employees?id=${org.id}`)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            View employees
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => setExtendState({ org, kind: 'trial' })}>
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Extend trial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setExtendState({ org, kind: 'subscription' })}
                          >
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Extend subscription
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            disabled={modeMut.isPending}
                            onClick={() =>
                              modeMut.mutate({
                                id: org.id,
                                mode: mode === 'auto' ? 'manual' : 'auto',
                              })
                            }
                          >
                            {mode === 'auto' ? (
                              <CreditCard className="mr-2 h-4 w-4" />
                            ) : (
                              <Zap className="mr-2 h-4 w-4" />
                            )}
                            Switch to {mode === 'auto' ? 'manual' : 'auto'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {startItem}–{endItem} of {totalItems}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v: any) => {
                  setPageSize(Number(v));
                  setPageNumber(1);
                }}
              >
                <SelectTrigger className="h-8 w-20">
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
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">
                {pageNumber} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExtendDialog
        state={extendState}
        submitting={extendMut.isPending}
        onClose={() => setExtendState({ org: null, kind: 'trial' })}
        onSubmit={(payload) =>
          extendState.org &&
          extendMut.mutate({
            id: extendState.org.id,
            kind: extendState.kind,
            payload,
          })
        }
      />
    </div>
  );
}
