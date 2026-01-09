import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import FeatureModal from '@/components/common/admin-panel/FeatureModal';

interface SubFeature {
  name: string;
  desc: string;
  planId: string;
  routes: { path: string; page: string }[];
}
interface Feature {
  id: number;
  name: string;
  desc?: string;
  subFeaturesList: SubFeature[];
}
interface FeatureListProps {
  features: Feature[];
  selectedFeatureId: number | null;
  onSelect: (f: Feature) => void;
  onCreate: (n: { id: number; name: string; desc?: string }) => void;
  onDelete: (id: number) => void;
}

export default function FeatureList({
  features,
  selectedFeatureId,
  onSelect,
  onCreate,
  onDelete,
}: FeatureListProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex w-72 flex-col rounded-lg bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Features</h2>
        <button
          className="rounded bg-teal-600 px-3 py-1 text-white"
          onClick={() => setShowModal(true)}
        >
          + Create Feature
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`relative cursor-pointer rounded border p-3 transition-all hover:bg-gray-100 ${selectedFeatureId === feature.id ? 'border-teal-300 bg-teal-50 shadow' : 'bg-white'} `}
            onClick={() => onSelect(feature)}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{feature.name}</div>
              <button
                className="rounded px-2 py-1 text-red-500 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(feature.id);
                }}
                title="Delete Feature"
                aria-label="Delete Feature"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Sub-features: {feature.subFeaturesList.length}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <FeatureModal
          onClose={() => setShowModal(false)}
          onCreate={(n) => {
            onCreate({ ...n, id: Date.now() });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
