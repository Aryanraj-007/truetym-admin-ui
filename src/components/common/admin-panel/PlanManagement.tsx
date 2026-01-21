'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlanDetailsData, fetchSubscriptionsData } from '@/store/thunks/subscriptionThunks';
import { ChevronDown, Edit, Trash2, X } from 'lucide-react';

// const availableFeatures = [
//   'Core HR Solution',
//   'Time & Attendance',
//   'Approval Management',
//   'Employee Facing App',
//   'Payroll Management',
//   'Income tax and Declarations',
//   'CATI',
//   'Plan Features',
// ];

// Popover that closes on outside click
function OrgsPopover({
  customers,
  open,
  close,
}: {
  customers: Array<{ id: string; name: string }>;
  open: boolean;
  close: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, close]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute top-6 left-0 z-20 w-64 rounded-xl border border-gray-100 bg-white p-3 shadow-lg"
    >
      <div className="mb-2 text-sm font-semibold">Organizations</div>
      <ul className="space-y-1">
        {customers.length === 0 && <li className="text-sm text-gray-400">No organizations</li>}
        {customers.map((customer) => (
          <li key={customer.id} className="flex items-center gap-2 py-1 text-sm text-gray-700">
            <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500"></span>
            <span>{customer.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlanManagement() {
  const dispatch = useAppDispatch();
  const { subscriptions, planDetails } = useAppSelector((state) => state.app);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(0);
  const [orgPopoverIdx, setOrgPopoverIdx] = useState<number | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  // Fetch subscriptions on component mount
  useEffect(() => {
    dispatch(fetchSubscriptionsData());
  }, [dispatch]);

  // Fetch plan details when subscriptions load or selectedPlanIdx changes
  useEffect(() => {
    if (subscriptions.data && subscriptions.data.length > 0) {
      const selectedPlan = subscriptions.data[selectedPlanIdx];
      if (selectedPlan) {
        dispatch(fetchPlanDetailsData(selectedPlan.id));
        setExpandedFeatures(new Set());
      }
    }
  }, [selectedPlanIdx, subscriptions.data, dispatch]);

  const handlePlanClick = (idx: number) => {
    setSelectedPlanIdx(idx);
  };

  const toggleFeature = (featureId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const plans = subscriptions.data;
  const selectedPlan = plans[selectedPlanIdx];

  if (subscriptions.loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (subscriptions.error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">Error loading plans</p>
          <p className="text-sm text-red-600">{subscriptions.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white">
      {/* LEFT: Plans list */}
      <section className="flex w-1/2 flex-col gap-8 overflow-y-auto border-r border-gray-200 p-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Plans</h1>
          {plans.length > 0 && (
            <button
              className="ml-auto rounded-lg bg-teal-500 px-5 py-2 font-semibold text-white transition-all hover:bg-teal-600"
              onClick={() => setShowPlanModal(true)}
            >
              Add custom plan
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {plans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-600">No plans available</p>
            </div>
          ) : (
            plans.map((plan, idx) => (
              <div
                role="none"
                key={plan.id}
                onClick={() => handlePlanClick(idx)}
                className={`relative cursor-pointer rounded-2xl border-l-4 px-6 py-5 transition-all ${
                  selectedPlanIdx === idx
                    ? 'border border-teal-300/50 border-l-teal-500 bg-cyan-100/40 shadow-md'
                    : 'border border-gray-200/50 border-l-gray-300 bg-gray-50/50 hover:bg-gray-100/30'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-lg font-bold text-gray-900">{plan.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">
                      Amount: <b className="text-base text-gray-800">₹{plan.amount}</b>
                    </span>
                    <span className="block text-sm font-medium text-gray-600">
                      Plan type:{' '}
                      <b className="text-base text-gray-800">
                        {plan.plan_type === 100 ? 'Monthly' : 'Yearly'}
                      </b>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">
                      Features: <b className="text-base text-gray-800">{plan.totalFeatures}</b>
                    </span>
                    <span className="relative block text-sm font-medium text-gray-600 select-none">
                      Customers:{' '}
                      <span
                        role="none"
                        className="cursor-pointer font-bold text-teal-600 underline hover:text-teal-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrgPopoverIdx(orgPopoverIdx === idx ? null : idx);
                        }}
                      >
                        {plan.totalCustomers}
                      </span>
                      <OrgsPopover
                        customers={plan.customerDetails}
                        open={orgPopoverIdx === idx}
                        close={() => setOrgPopoverIdx(null)}
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* RIGHT: Plan details */}
      <section className="flex w-1/2 flex-col gap-6 overflow-y-auto p-10">
        <h2 className="text-3xl font-bold text-gray-900">Plan details</h2>

        {selectedPlan && (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Plan name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPlan.title}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-base font-medium text-gray-900 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowPlanModal(true)}
              className="w-full rounded-lg border-2 border-cyan-300 bg-cyan-100/40 px-5 py-3 text-base font-semibold text-teal-700 transition-colors hover:bg-cyan-100/60"
            >
              Add new feature →
            </button>

            {planDetails.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500"></div>
              </div>
            ) : planDetails.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">{planDetails.error}</p>
              </div>
            ) : planDetails.data?.featureList && planDetails.data.featureList.length > 0 ? (
              <div className="space-y-2">
                {planDetails.data.featureList.map((feature) => (
                  <div
                    key={feature.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleFeature(feature.id)}
                      className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          className={`h-5 w-5 text-gray-600 transition-transform ${
                            expandedFeatures.has(feature.id) ? 'rotate-180' : ''
                          }`}
                        />
                        <h4 className="text-left font-semibold text-gray-900">{feature.title}</h4>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="p-1 text-gray-400 transition-colors hover:text-teal-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          className="p-1 text-gray-400 transition-colors hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {expandedFeatures.has(feature.id) && feature.subFeatures && (
                      <div className="space-y-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
                        {feature.subFeatures.map((subFeature) => (
                          <div key={subFeature.id} className="py-1 text-sm text-gray-600">
                            • {subFeature.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h4 className="mb-4 text-base font-semibold text-gray-900">
                  No features are added.
                </h4>
              </div>
            )}
          </>
        )}
      </section>
      {/* Modal for Adding Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="w-[500px] rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add custom plan</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  Plan name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. Basic"
                  className="w-full rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block font-semibold text-gray-800">Plan description</label>
                <textarea
                  placeholder="e.g. Descriptive text for your plan"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  Billing amount (per license) <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. 100.00"
                  type="number"
                  className="w-full rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  Billing frequency <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min={1}
                    defaultValue="1"
                    className="w-1/3 rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                  />
                  <select className="w-2/3 rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none">
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </button>
              <button className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white transition-all hover:bg-teal-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
