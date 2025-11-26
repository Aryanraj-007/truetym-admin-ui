
import { useState } from "react";
import SubFeatureModal from "./SubFeatureModal";
import { Pencil, Trash2 } from "lucide-react";

interface RouteObj {
  path: string;
  page: string;
}
interface SubFeature {
  name: string;
  desc: string;
  planId: string;
  routes: RouteObj[];
}
interface Feature {
  id: number;
  name: string;
  desc?: string;
  subFeaturesList: SubFeature[];
}
interface FeatureDetailProps {
  feature: Feature | null;
  onAddSubFeature: (sf: SubFeature) => void;
  onEditSubFeature: (idx: number, sf: SubFeature) => void;
  onDeleteSubFeature: (idx: number) => void;
}

export default function FeatureDetail({
  feature,
  onAddSubFeature,
  onEditSubFeature,
  onDeleteSubFeature,
}: FeatureDetailProps) {
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  if (!feature)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a feature to view details
      </div>
    );
  const subFeatures = feature.subFeaturesList;

  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-bold">{feature.name}</div>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Sub-features</h4>
        <div className="space-y-3">
          {subFeatures.length === 0 && (
            <div className="text-gray-400">No sub-features added yet. Add one to get started.</div>
          )}
          {subFeatures.map((sf, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 border rounded px-3 py-2 bg-white hover:bg-teal-50 transition"
            >
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">{idx + 1}</span>
              <span className="flex-1">{sf.name}</span>
              <button
                className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                onClick={() => {
                  setEditIdx(idx);
                  setEditModalOpen(true);
                }}
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                className="text-red-500 hover:bg-red-100 p-1 rounded"
                onClick={() => onDeleteSubFeature(idx)}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        className="self-start bg-blue-100 text-blue-700 px-3 py-1 rounded mt-3"
        onClick={() => setShowModal(true)}
      >
        + Add new sub-feature
      </button>

      {/* Add Modal */}
      {showModal && (
        <SubFeatureModal
          onClose={() => setShowModal(false)}
          onSave={sub => {
            onAddSubFeature(sub);
            setShowModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && editIdx !== null && (
        <SubFeatureModal
          onClose={() => {
            setEditModalOpen(false);
            setEditIdx(null);
          }}
          onSave={sf => {
            onEditSubFeature(editIdx, sf);
            setEditModalOpen(false);
            setEditIdx(null);
          }}
          editMode
          initial={subFeatures[editIdx]}
        />
      )}
    </div>
  );
}
