// src/components/common/admin-panel/FeatureModal.tsx
import { useState } from 'react';

import { createFeature } from '@/lib/api';

interface FeatureModalProps {
  onClose: () => void;
  onCreate: (feature: Feature) => void;
}

interface Feature {
  id: number;
  name: string;
  subFeatures: number;
  desc?: string;
}

export default function FeatureModal({ onClose, onCreate }: FeatureModalProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createFeature({
        title,
        description: desc,
      });

      if (response.succeeded) {
        // Create feature with API response data
        onCreate({
          id: Date.now(),
          name: response.data.title,
          subFeatures: 0,
          desc: response.data.description,
        });
      } else {
        setError(response.message?.[0] || 'Failed to create feature');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the feature');
      console.error('Error creating feature:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(236,240,241,0.7)]">
      <form className="w-96 space-y-4 rounded bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold">Create New Feature</h3>
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
            className="rounded bg-gray-100 px-3 py-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-teal-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
