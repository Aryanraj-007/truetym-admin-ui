// src/components/common/admin-panel/FeatureModal.tsx
import { useState } from 'react';

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({ id: Date.now(), name: title, subFeatures: 0, desc });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(236,240,241,0.7)]">
      <form className="w-96 space-y-4 rounded bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold">Create New Feature</h3>
        <div>
          <label className="mb-1 block">Title *</label>
          <input
            className="w-full rounded border px-3 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block">Description</label>
          <textarea
            className="w-full rounded border px-3 py-1"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded bg-gray-100 px-3 py-1">
            Cancel
          </button>
          <button type="submit" className="rounded bg-teal-600 px-3 py-1 text-white">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
