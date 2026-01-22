import { useState } from 'react';

import { updateFeature } from '@/lib/api';

interface EditFeatureModalProps {
  featureId: string;
  featureName: string;
  featureDesc?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFeatureModal({
  featureId,
  featureName,
  featureDesc,
  onClose,
  onSuccess,
}: EditFeatureModalProps) {
  const [title, setTitle] = useState(featureName);
  const [desc, setDesc] = useState(featureDesc || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await updateFeature(featureId, {
        title,
        descriptions: desc,
      });

      if (response.succeeded) {
        onSuccess();
      } else {
        setError(response.message?.[0] || 'Failed to update feature');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the feature');
      console.error('Error updating feature:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(236,240,241,0.7)]">
      <form className="w-96 space-y-4 rounded bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold">Edit Feature</h3>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block">Title *</label>
          <input
            className="w-full rounded border px-3 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block">Description</label>
          <textarea
            className="w-full rounded border px-3 py-1"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
