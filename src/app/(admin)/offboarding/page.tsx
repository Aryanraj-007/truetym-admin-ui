'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  DeleteStep,
  executeOffboarding,
  getOffboardingPreview,
  PreviewResult,
  streamOffboarding,
  TargetType,
} from '@/lib/offboarding';

export default function OffboardingPanel() {
  const [targetType, setTargetType] = useState<TargetType>('org');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [steps, setSteps] = useState<DeleteStep[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const confirmed = useMemo(
    () => !!preview && confirmName.trim() === preview.displayName.trim(),
    [confirmName, preview],
  );
  const stepTotal = useMemo(() => steps.reduce((s, x) => s + x.deleted, 0), [steps]);

  function reset() {
    setPreview(null);
    setConfirmName('');
    setSteps([]);
    setDone(false);
  }

  async function loadPreview() {
    if (!id.trim()) return toast.error('Enter an id first');
    setLoading(true);
    reset();
    try {
      const data = await getOffboardingPreview(targetType, id.trim());
      setPreview(data);
      if (data.totalRows === 0) toast.info('No rows found for this target.');
    } catch (e: any) {
      toast.error(e.message ?? 'Preview failed');
    } finally {
      setLoading(false);
    }
  }

  // ---- Mode A: atomic delete -------------------------------------------------
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
    setDone(false);
    try {
      const data = await executeOffboarding({
        targetType,
        id: preview.id,
        confirmationName: confirmName,
      });
      setSteps(data.steps);
      setDone(true);
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

  // ---- Mode B: live step-by-step --------------------------------------------
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
    setDone(false);
    try {
      await streamOffboarding(
        { targetType, id: preview.id, confirmationName: confirmName },
        {
          onStep: (step: any) => setSteps((prev) => [...prev, step]),
          onDone: () => {
            setDone(true);
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Offboarding · Permanent Delete</h1>
        <p className="text-sm text-rose-600">
          This is a HARD delete from MySQL and MongoDB. There is no undo. Use on test data only.
        </p>
      </header>

      {/* Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 inline-flex rounded-lg border border-slate-200 p-1">
          {(['org', 'user'] as TargetType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTargetType(t);
                reset();
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                targetType === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'org' ? 'Offboard Organisation' : 'Offboard Employee'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={targetType === 'org' ? 'Organisation id' : 'User id'}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <button
            onClick={loadPreview}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load preview'}
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <div>
              <span className="text-xs tracking-wide text-slate-400 uppercase">Target</span>
              <p className="font-semibold text-slate-900">{preview.displayName}</p>
            </div>
            {preview.targetType === 'org' && <Stat label="Employees" value={preview.userCount} />}
            <Stat label="Stores affected" value={preview.rows.length} />
            <Stat label="Total rows" value={preview.totalRows} highlight />
          </div>

          <div className="max-h-80 overflow-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Store</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2 text-right">Rows</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r: any, i: number) => (
                  <tr key={r.source + r.name} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-slate-800">{r.name}</td>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirmation + danger zone */}
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <label className="text-sm font-medium text-rose-800">
              Type <span className="font-mono">{preview.displayName}</span> to confirm
            </label>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Exact name"
              className="mt-2 w-full rounded-lg border border-rose-300 px-3 py-2 text-sm outline-none focus:border-rose-600"
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={deleteAtomic}
                disabled={!confirmed || running}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Delete all (atomic)
              </button>
              <button
                onClick={deleteStepByStep}
                disabled={!confirmed || running}
                className="rounded-lg border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-40"
              >
                Delete step-by-step (live)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live / final result */}
      {steps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {running ? 'Deleting…' : done ? 'Completed' : 'Result'}
            </h2>
            <span className="text-sm text-slate-500">{stepTotal} rows deleted</span>
          </div>
          <div className="max-h-96 space-y-1 overflow-auto">
            {steps.map((s, i) => (
              <div
                key={s.source + s.name + i}
                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className={s.status === 'ok' ? 'text-emerald-600' : 'text-rose-600'}>
                    {s.status === 'ok' ? '✓' : '✕'}
                  </span>
                  <span className="font-mono text-xs text-slate-700">{s.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{s.source}</span>
                </span>
                <span className="text-slate-600">
                  {s.status === 'ok' ? `${s.deleted} deleted` : s.error}
                </span>
              </div>
            ))}
          </div>
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
      <span className="text-xs tracking-wide text-slate-400 uppercase">{label}</span>
      <p className={`font-semibold ${highlight ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
