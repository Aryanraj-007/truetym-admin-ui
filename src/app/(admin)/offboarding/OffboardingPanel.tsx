'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Your existing org list API (already returns plan + status):
import { fetchOrganizations, getStatusLabel } from '@/lib/api';
import {
  DeleteStep,
  executeOffboarding,
  getOffboardingPreview,
  PickItem,
  PreviewResult,
  searchUsers,
  streamOffboarding,
  TargetType,
} from '@/lib/offboarding';

interface Props {
  initialId?: string;
  initialType?: TargetType;
}

export default function OffboardingPanel({ initialId, initialType = 'org' }: Readonly<Props>) {
  const router = useRouter();

  const [targetType, setTargetType] = useState<TargetType>(initialType);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickItem[]>([]);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState<PickItem | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [confirmName, setConfirmName] = useState('');
  const [steps, setSteps] = useState<DeleteStep[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const cameFromRoute = !!initialId;

  const confirmed = useMemo(
    () => !!preview && confirmName.trim() === preview.displayName.trim(),
    [confirmName, preview],
  );
  const stepTotal = useMemo(() => steps.reduce((s, x) => s + x.deleted, 0), [steps]);

  // ---------------------------------------------------------------------------
  // load preview for an id
  // ---------------------------------------------------------------------------
  const loadPreview = useCallback(async (type: TargetType, id: string) => {
    setLoadingPreview(true);
    setPreview(null);
    setConfirmName('');
    setSteps([]);
    setCompleted(false);
    try {
      const data = await getOffboardingPreview(type, id);
      setPreview(data);
      if (data.totalRows === 0) toast.info('No linked rows found for this target.');
    } catch (e: any) {
      toast.error(e.message ?? 'Preview failed');
      setSelected(null);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // open directly from a row icon (/offboarding/[id]?type=)
  useEffect(() => {
    if (initialId) {
      setSelected({ id: initialId, name: '', subtitle: '', isActive: false, statusLabel: '' });
      loadPreview(initialType, initialId);
    }
  }, [initialId, initialType, loadPreview]);

  // ---------------------------------------------------------------------------
  // debounced search
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (selected) return; // not in picker mode
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        let items: PickItem[] = [];
        if (targetType === 'org') {
          const res = await fetchOrganizations(1, 25, q, '', '', 'created_at', 'ASC');
          items = (res.data ?? []).map((o: any) => {
            const label = getStatusLabel(o.status) || 'Inactive';
            return {
              id: o.id,
              name: o.org_name ?? '-',
              subtitle: [o.planTitle, o.website].filter(Boolean).join(' · ') || '-',
              statusLabel: label,
              isActive: label === 'Active',
            } as PickItem;
          });
        } else {
          items = await searchUsers(q);
        }
        if (!cancelled) setResults(items);
      } catch (e: any) {
        if (!cancelled) toast.error(e.message ?? 'Search failed');
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, targetType, selected]);

  // ---------------------------------------------------------------------------
  // actions
  // ---------------------------------------------------------------------------
  function pick(item: PickItem) {
    setSelected(item);
    setResults([]);
    setQuery('');
    loadPreview(targetType, item.id);
  }

  function resetAll(navigate = false) {
    setSelected(null);
    setPreview(null);
    setConfirmName('');
    setSteps([]);
    setCompleted(false);
    setQuery('');
    setResults([]);
    if (navigate && cameFromRoute) router.replace('/offboarding');
  }

  function switchType(t: TargetType) {
    setTargetType(t);
    resetAll();
  }

  async function deleteAtomic() {
    if (!preview || !confirmed) return;
    if (
      !window.confirm(
        `PERMANENTLY delete "${preview.displayName}" and ALL linked data? This cannot be undone.`,
      )
    )
      return;
    setRunning(true);
    setSteps([]);
    try {
      const data = await executeOffboarding({
        targetType,
        id: preview.id,
        confirmationName: confirmName,
      });
      setSteps(data.steps);
      setCompleted(true);
      if (data.hadErrors) {
        toast.warning(`Done with some errors. ${data.totalDeleted} rows deleted.`);
      } else {
        toast.success(`Deleted ${data.totalDeleted} rows across ${data.steps.length} stores.`);
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Delete failed');
    } finally {
      setRunning(false);
    }
  }

  async function deleteStepByStep() {
    if (!preview || !confirmed) return;
    if (
      !window.confirm(
        `PERMANENTLY delete "${preview.displayName}" step by step? This cannot be undone.`,
      )
    )
      return;
    setRunning(true);
    setSteps([]);
    try {
      await streamOffboarding(
        { targetType, id: preview.id, confirmationName: confirmName },
        {
          onStep: (step: any) => setSteps((prev) => [...prev, step]),
          onDone: () => {
            setCompleted(true);
            toast.success('Step-by-step deletion finished.');
          },
          onError: (msg: any) => toast.error(msg),
        },
      );
    } catch (e: any) {
      toast.error(e.message ?? 'Streaming delete failed');
    } finally {
      setRunning(false);
    }
  }

  // ---------------------------------------------------------------------------
  // render
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header className="space-y-1">
        {cameFromRoute && (
          <button
            onClick={() => router.push('/organisations')}
            className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Organizations
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900">Offboarding</h1>
        <p className="text-sm text-red-600">
          Permanent HARD delete from MySQL and MongoDB — there is no undo. Use for test data.
        </p>
      </header>

      {/* Type toggle (hidden when opened from a specific row) */}
      {!cameFromRoute && (
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          {(['org', 'user'] as TargetType[]).map((t) => (
            <button
              key={t}
              onClick={() => switchType(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                targetType === t ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'org' ? 'Offboard Organisation' : 'Offboard Employee'}
            </button>
          ))}
        </div>
      )}

      {/* ---- PICKER (search by name) ---- */}
      {!selected && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                targetType === 'org'
                  ? 'Search organisation by name…'
                  : 'Search employee by name / email…'
              }
              className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="mt-3 divide-y rounded-lg border border-gray-100">
            {searching && <div className="px-3 py-4 text-sm text-gray-500">Searching…</div>}
            {!searching && query.trim().length >= 2 && results.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500">No matches.</div>
            )}
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => pick(r)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-900">{r.name}</span>
                  <span className="block text-xs text-gray-500">{r.subtitle}</span>
                </span>
                <span
                  className={`rounded px-2.5 py-1 text-xs font-semibold text-white ${
                    r.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {r.statusLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingPreview && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading preview…
        </div>
      )}

      {/* ---- PREVIEW + DANGER ZONE ---- */}
      {preview && !completed && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <div>
              <span className="text-xs tracking-wide text-gray-400 uppercase">Target</span>
              <p className="font-semibold text-gray-900">{preview.displayName}</p>
            </div>
            {selected?.statusLabel && (
              <div>
                <span className="text-xs tracking-wide text-gray-400 uppercase">
                  Subscription / Status
                </span>
                <p className="font-semibold text-gray-900">
                  {selected.subtitle === '-' ? '' : `${selected.subtitle} · `}
                  <span className={selected.isActive ? 'text-green-600' : 'text-red-600'}>
                    {selected.statusLabel}
                  </span>
                </p>
              </div>
            )}
            {preview.targetType === 'org' && <Stat label="Employees" value={preview.userCount} />}
            <Stat label="Stores affected" value={preview.rows.length} />
            <Stat label="Total rows" value={preview.totalRows} highlight />
          </div>

          <div className="max-h-80 overflow-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Store</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2 text-right">Rows</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                      Nothing linked — only the{' '}
                      {preview.targetType === 'org' ? 'organisation' : 'user'} row itself will be
                      removed.
                    </td>
                  </tr>
                ) : (
                  preview.rows.map((r: any, i: number) => (
                    <tr key={r.source + r.name} className="border-t border-gray-100">
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono text-xs text-gray-800">{r.name}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            r.source === 'mysql'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {r.source}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium">{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <label className="text-sm font-medium text-red-800">
              Type <span className="font-mono">{preview.displayName}</span> to confirm
            </label>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Exact name"
              className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-600"
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={deleteAtomic}
                disabled={!confirmed || running}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" /> {running ? 'Deleting…' : 'Delete all (atomic)'}
              </button>
              <button
                onClick={deleteStepByStep}
                disabled={!confirmed || running}
                className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
              >
                Delete step-by-step (live)
              </button>
              <button
                onClick={() => resetAll(true)}
                disabled={running}
                className="ml-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- LIVE / COMPLETED RESULT ---- */}
      {steps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              {completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {running ? 'Deleting…' : completed ? 'Completed' : 'Result'}
            </h2>
            <span className="text-sm text-gray-500">{stepTotal} rows deleted</span>
          </div>
          <div className="max-h-96 space-y-1 overflow-auto">
            {steps.map((s, i) => (
              <div
                key={s.source + s.name + i}
                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <span className={s.status === 'ok' ? 'text-emerald-600' : 'text-red-600'}>
                    {s.status === 'ok' ? '✓' : '✕'}
                  </span>
                  <span className="font-mono text-xs text-gray-700">{s.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase">{s.source}</span>
                </span>
                <span className="text-gray-600">
                  {s.status === 'ok' ? `${s.deleted} deleted` : s.error}
                </span>
              </div>
            ))}
          </div>

          {completed && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => resetAll(true)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
              >
                Offboard another
              </button>
              <button
                onClick={() => router.push('/dashboard/organ')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Back to Organizations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: Readonly<{ label: string; value: number; highlight?: boolean }>) {
  return (
    <div>
      <span className="text-xs tracking-wide text-gray-400 uppercase">{label}</span>
      <p className={`font-semibold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
