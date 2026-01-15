'use client';

import { useState } from 'react';

import FeatureDetail from '@/components/common/admin-panel/FeatureDetail';
import FeatureList from '@/components/common/admin-panel/FeatureList';

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

export default function FeatureManagementPage() {
  // Central feature state contains ALL features and their sub-features.
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: 'CATI', subFeaturesList: [] },
    { id: 2, name: 'Plan Features', subFeaturesList: [] },
  ]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);

  function handleSelectFeature(feature: Feature) {
    setSelectedFeatureId(feature.id);
  }

  function handleCreateFeature(newFeature: { id: number; name: string; desc?: string }) {
    setFeatures([...features, { ...newFeature, subFeaturesList: [] }]);
  }

  function handleDeleteFeature(id: number) {
    setFeatures(features.filter((f) => f.id !== id));
    if (selectedFeatureId === id) setSelectedFeatureId(null);
  }

  function handleAddSubFeature(sub: SubFeature) {
    setFeatures((features) =>
      features.map((f) =>
        f.id === selectedFeatureId ? { ...f, subFeaturesList: [...f.subFeaturesList, sub] } : f,
      ),
    );
  }

  function handleEditSubFeature(index: number, updated: SubFeature) {
    setFeatures((features) =>
      features.map((f) =>
        f.id === selectedFeatureId
          ? {
              ...f,
              subFeaturesList: f.subFeaturesList.map((sf, i) => (i === index ? updated : sf)),
            }
          : f,
      ),
    );
  }

  function handleDeleteSubFeature(index: number) {
    setFeatures((features) =>
      features.map((f) =>
        f.id === selectedFeatureId
          ? {
              ...f,
              subFeaturesList: f.subFeaturesList.filter((_, i) => i !== index),
            }
          : f,
      ),
    );
  }

  const selectedFeature = features.find((f) => f.id === selectedFeatureId) || null;

  return (
    <div className="flex h-full flex-1 bg-gray-50 p-6">
      <FeatureList
        features={features}
        selectedFeatureId={selectedFeatureId}
        onSelect={handleSelectFeature}
        onCreate={handleCreateFeature}
        onDelete={handleDeleteFeature}
      />
      <div className="mx-6 w-px bg-gray-200" />
      <FeatureDetail
        feature={selectedFeature}
        onAddSubFeature={handleAddSubFeature}
        onEditSubFeature={handleEditSubFeature}
        onDeleteSubFeature={handleDeleteSubFeature}
      />
    </div>
  );
}
