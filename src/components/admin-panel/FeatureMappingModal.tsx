'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

import {
  APIFeature,
  FeatureRoute,
  fetchFeatureRoutes,
  fetchFeatures,
  mapFeaturesTopPlan,
} from '@/lib/api';

interface MappedFeature {
  id: string;
  title: string;
  subFeatures?: Array<{
    id: string;
    title: string;
  }>;
}

interface FeatureMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  razorpayPlanId: string;
  planTitle: string;
  currentMappedFeatures?: MappedFeature[];
  onSuccess?: () => void;
}

interface FeatureWithRoutes extends APIFeature {
  routes?: FeatureRoute;
}

export default function FeatureMappingModal({
  isOpen,
  onClose,
  planId,
  razorpayPlanId,
  planTitle,
  currentMappedFeatures,
  onSuccess,
}: FeatureMappingModalProps) {
  const [features, setFeatures] = useState<FeatureWithRoutes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track selected features and subfeatures
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [selectedSubFeatures, setSelectedSubFeatures] = useState<Set<string>>(new Set());

  // Fetch features and routes on modal open
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [featuresRes] = await Promise.all([fetchFeatures(), fetchFeatureRoutes()]);

        if (featuresRes.succeeded && featuresRes.data) {
          setFeatures(featuresRes.data);
          // Select first feature by default
          if (featuresRes.data.length > 0) {
            setSelectedFeatureId(featuresRes.data[0].id);
          }

          // Initialize selected features and subfeatures from currentMappedFeatures
          if (currentMappedFeatures && currentMappedFeatures.length > 0) {
            const mappedFeatureIds = new Set<string>();
            const mappedSubFeatureIds = new Set<string>();

            currentMappedFeatures.forEach((mappedFeature) => {
              mappedFeatureIds.add(mappedFeature.id);
              if (mappedFeature.subFeatures) {
                mappedFeature.subFeatures.forEach((subFeature) => {
                  mappedSubFeatureIds.add(subFeature.id);
                });
              }
            });

            setSelectedFeatures(mappedFeatureIds);
            setSelectedSubFeatures(mappedSubFeatureIds);
          }
        } else {
          setError('Failed to load features');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMsg);
        console.error('Error fetching features:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, currentMappedFeatures]);

  const handleFeatureCheckChange = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
      // Also remove all subfeatures of this feature
      const feature = features.find((f) => f.id === featureId);
      if (feature) {
        feature.subFeatures.forEach((sf) => {
          selectedSubFeatures.delete(sf.id);
        });
      }
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const handleSubFeatureCheckChange = (subFeatureId: string, featureId: string) => {
    const newSelected = new Set(selectedSubFeatures);
    if (newSelected.has(subFeatureId)) {
      newSelected.delete(subFeatureId);
    } else {
      newSelected.add(subFeatureId);
      // Ensure parent feature is selected
      if (!selectedFeatures.has(featureId)) {
        selectedFeatures.add(featureId);
        setSelectedFeatures(new Set(selectedFeatures));
      }
    }
    setSelectedSubFeatures(newSelected);
  };

  const toggleFeatureExpand = (featureId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const filteredFeatures = features.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedFeature = features.find((f) => f.id === selectedFeatureId);

  const handleSave = async () => {
    if (selectedFeatures.size === 0) {
      setError('Please select at least one feature');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Build the features array for the API
      const featuresToMap = Array.from(selectedFeatures).map((featureId) => ({
        id: featureId,
        subfeatureIds: Array.from(selectedSubFeatures).filter((subfeatId) => {
          // Check if this subfeature belongs to this feature
          const feature = features.find((f) => f.id === featureId);
          return feature?.subFeatures.some((sf) => sf.id === subfeatId);
        }),
      }));

      const response = await mapFeaturesTopPlan({
        subcriptionId: planId,
        razorpayPlanId: razorpayPlanId,
        features: featuresToMap,
      });

      if (response.succeeded) {
        setSuccess('Features mapped successfully!');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError(response.message[0] || 'Failed to map features');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to map features';
      setError(errorMsg);
      console.error('Error mapping features:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="flex h-[90vh] w-[90vw] max-w-6xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-8 py-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Map Features to Plan</h3>
            <p className="mt-1 text-sm text-gray-600">{planTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-8 mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-8 mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Features List */}
          <div className="flex w-1/2 flex-col border-r border-gray-200 p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-teal-400/60 focus:outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500"></div>
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">No features found</p>
                </div>
              ) : (
                filteredFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      selectedFeatureId === feature.id
                        ? 'border-teal-300 bg-cyan-100/40'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => setSelectedFeatureId(feature.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.has(feature.id)}
                        onChange={() => handleFeatureCheckChange(feature.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{feature.title}</p>
                        {feature.descriptions && (
                          <p className="text-xs text-gray-500">{feature.descriptions}</p>
                        )}
                      </div>
                    </div>

                    {/* Subfeatures Preview */}
                    {feature.subFeatures && feature.subFeatures.length > 0 && (
                      <button
                        onClick={() => toggleFeatureExpand(feature.id)}
                        className="mt-2 ml-7 flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedFeatures.has(feature.id) ? 'rotate-180' : ''
                          }`}
                        />
                        {feature.subFeatures.length} sub-features
                      </button>
                    )}

                    {expandedFeatures.has(feature.id) &&
                      feature.subFeatures &&
                      feature.subFeatures.length > 0 && (
                        <div className="mt-3 ml-7 space-y-2 border-t border-gray-200 pt-3">
                          {feature.subFeatures.map((subFeature) => (
                            <div key={subFeature.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSubFeatures.has(subFeature.id)}
                                onChange={() =>
                                  handleSubFeatureCheckChange(subFeature.id, feature.id)
                                }
                                className="h-3 w-3 cursor-pointer rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-xs text-gray-700">{subFeature.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Feature Details & Sub-features */}
          <div className="flex w-1/2 flex-col overflow-hidden p-6">
            {selectedFeature ? (
              <>
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900">{selectedFeature.title}</h4>
                  {selectedFeature.descriptions && (
                    <p className="mt-2 text-sm text-gray-600">{selectedFeature.descriptions}</p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  <h5 className="mb-4 text-sm font-semibold text-gray-700">Sub-features</h5>
                  {selectedFeature.subFeatures && selectedFeature.subFeatures.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFeature.subFeatures.map((subFeature) => (
                        <div
                          key={subFeature.id}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSubFeatures.has(subFeature.id)}
                              onChange={() =>
                                handleSubFeatureCheckChange(subFeature.id, selectedFeature.id)
                              }
                              className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{subFeature.title}</p>
                              {subFeature.descriptions && (
                                <p className="mt-1 text-xs text-gray-600">
                                  {subFeature.descriptions}
                                </p>
                              )}
                              {subFeature.featureRoutes && (
                                <div className="mt-2">
                                  {subFeature.featureRoutes.routes && (
                                    <div className="text-xs text-gray-600">
                                      <p className="font-semibold text-gray-700">Routes:</p>
                                      <div className="ml-2 space-y-1">
                                        {subFeature.featureRoutes.routes.map((route, idx) => (
                                          <p key={idx} className="text-gray-600">
                                            • {route}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {subFeature.featureRoutes.pages && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      <p className="font-semibold text-gray-700">Pages:</p>
                                      <div className="ml-2 space-y-1">
                                        {subFeature.featureRoutes.pages.map((page, idx) => (
                                          <p key={idx} className="text-gray-600">
                                            • {page}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No sub-features available</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Select a feature to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 px-8 py-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || selectedFeatures.size === 0}
            className="rounded-lg bg-teal-500 px-6 py-2 font-semibold text-white transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
