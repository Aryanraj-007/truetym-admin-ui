import { Trash2 } from "lucide-react";
import { useState } from "react";
import FeatureModal from "./FeatureModal";

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
    <div className="w-72 bg-white p-4 rounded-lg shadow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Features</h2>
        <button
          className="bg-teal-600 text-white rounded px-3 py-1"
          onClick={() => setShowModal(true)}
        >
          + Create Feature
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {features.map(feature => (
          <div
            key={feature.id}
            className={`relative p-3 border rounded cursor-pointer hover:bg-gray-100 transition-all
              ${selectedFeatureId === feature.id ? "bg-teal-50 border-teal-300 shadow" : "bg-white"}
              `}
            onClick={() => onSelect(feature)}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{feature.name}</div>
              <button
                className="text-red-500 hover:bg-red-100 px-2 py-1 rounded"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(feature.id);
                }}
                title="Delete Feature"
                aria-label="Delete Feature"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Sub-features: {feature.subFeaturesList.length}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <FeatureModal
          onClose={() => setShowModal(false)}
          onCreate={n => {
            onCreate({ ...n, id: Date.now() });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
