'use client';

import { useEffect, useState } from 'react';

import { APIFeature, fetchFeatures } from '@/lib/api';
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

// Transform API response to match component interfaces
const transformAPIToFeatures = (apiFeatures: APIFeature[]): Feature[] => {
  return apiFeatures.map((apiFeature, index) => ({
    id: index + 1, // Use index as numeric ID since API returns string IDs
    name: apiFeature.title,
    desc: apiFeature.descriptions,
    subFeaturesList: apiFeature.subFeatures.map((apiSub) => ({
      name: apiSub.title,
      desc: apiSub.descriptions || '',
      planId: apiSub.id,
      routes: apiSub.featureRoutes
        ? apiSub.featureRoutes.pages.map((page, idx) => ({
            path: apiSub.featureRoutes.routes[idx] || '',
            page: page,
          }))
        : [],
    })),
  }));
};

export default function FeatureManagementPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);

  // Fetch features from API on component mount
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchFeatures();
        if (response.succeeded && response.data) {
          const transformedFeatures = transformAPIToFeatures(response.data);
          setFeatures(transformedFeatures);
          // Auto-select first feature
          if (transformedFeatures.length > 0) {
            setSelectedFeatureId(transformedFeatures[0].id);
          }
        } else {
          throw new Error(response.message?.[0] || 'API response indicates failure');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load features');
        console.error('Error loading features:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Loading features...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Error Loading Features</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          No features available
        </div>
      </div>
    );
  }

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
