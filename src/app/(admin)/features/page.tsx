'use client';

import { useEffect, useState } from 'react';

import {
  APIFeature,
  createSubFeature,
  deleteSubFeature,
  fetchFeatures,
  updateSubFeature,
} from '@/lib/api';
import FeatureDetail from '@/components/admin-panel/FeatureDetail';
import FeatureList from '@/components/admin-panel/FeatureList';
import { SubFeature } from '@/components/admin-panel/SubFeatureModal';

interface Feature {
  id: number;
  apiId: string; // Store the API feature ID for delete operations
  name: string;
  desc?: string;
  subFeaturesList: SubFeature[];
}

// Transform API response to match component interfaces
const transformAPIToFeatures = (apiFeatures: APIFeature[]): Feature[] => {
  return apiFeatures.map((apiFeature, index) => ({
    id: index + 1, // Use index as numeric ID since API returns string IDs
    apiId: apiFeature.id, // Store the API feature ID for delete operations
    name: apiFeature.title,
    desc: apiFeature.descriptions,
    subFeaturesList: apiFeature.subFeatures.map((apiSub) => ({
      id: apiSub.id, // Store the sub-feature ID
      title: apiSub.title,
      descriptions: apiSub.descriptions || undefined,
      featureRoutes: apiSub.featureRoutes || undefined,
    })),
  }));
};

export default function FeatureManagementPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);

  // Function to fetch and reload features from API
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

  // Fetch features from API on component mount
  useEffect(() => {
    loadFeatures();
  }, []);

  function handleSelectFeature(feature: Feature) {
    setSelectedFeatureId(feature.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleCreateFeature(_newFeature: { id: number; name: string; desc?: string }) {
    // Refetch features after creation
    loadFeatures();
  }

  function handleDeleteFeature(id: number) {
    // Refetch features after deletion
    loadFeatures();
    if (selectedFeatureId === id) setSelectedFeatureId(null);
  }

  function handleAddSubFeature(sub: SubFeature) {
    const selectedFeature = features.find((f) => f.id === selectedFeatureId);
    if (!selectedFeature) return;

    // Call API to create sub-feature
    (async () => {
      try {
        const response = await createSubFeature(selectedFeature.apiId, sub);
        if (response.succeeded) {
          // Reload features to get the updated list from the server
          loadFeatures();
        } else {
          console.error('Failed to create sub-feature:', response.message);
          alert(`Failed to create sub-feature: ${response.message?.[0] || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating sub-feature:', error);
        alert(
          `Error creating sub-feature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })();
  }

  function handleEditSubFeature(index: number, subFeatureId: string, updated: SubFeature) {
    const selectedFeature = features.find((f) => f.id === selectedFeatureId);
    if (!selectedFeature) return;

    // Call API to update sub-feature
    (async () => {
      try {
        const response = await updateSubFeature(selectedFeature.apiId, subFeatureId, updated);
        if (response.succeeded) {
          // Reload features to get the updated list from the server
          loadFeatures();
        } else {
          console.error('Failed to update sub-feature:', response.message);
          alert(`Failed to update sub-feature: ${response.message?.[0] || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error updating sub-feature:', error);
        alert(
          `Error updating sub-feature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })();
  }

  function handleDeleteSubFeature(index: number) {
    const selectedFeature = features.find((f) => f.id === selectedFeatureId);
    const subFeatureToDelete = selectedFeature?.subFeaturesList[index];

    if (!selectedFeature || !subFeatureToDelete?.id) return;

    const subFeatureId = subFeatureToDelete.id;

    // Call API to delete sub-feature
    (async () => {
      try {
        const response = await deleteSubFeature(selectedFeature.apiId, subFeatureId);
        if (response.succeeded) {
          // Reload features to get the updated list from the server
          loadFeatures();
        } else {
          console.error('Failed to delete sub-feature:', response.message);
          alert(`Failed to delete sub-feature: ${response.message?.[0] || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting sub-feature:', error);
        alert(
          `Error deleting sub-feature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })();
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
        onUpdateFeature={loadFeatures}
      />
    </div>
  );
}
