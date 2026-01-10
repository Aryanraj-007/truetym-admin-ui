'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';

const orgsByPlan = [
  ['Global Solutions Inc', 'Digital Dynamics', 'Enterprise Systems', 'Future Tech Co'],
  ['Northwind LLC', 'Mega Enterprises'],
  [],
];

interface Plan {
  name: string;
  amount: number | string;
  period: number;
  freq: string;
  features: string[];
  customers: number;
  description?: string;
}

const initialPlans: Plan[] = [
  {
    name: 'Basic',
    amount: 75,
    period: 1,
    freq: 'Monthly',
    features: ['Core HR Solution', 'Time & Attendance'],
    customers: 4,
  },
  {
    name: 'Standard',
    amount: 100,
    period: 1,
    freq: 'Monthly',
    features: [
      'Approval Management',
      'Employee Facing App',
      'Payroll Management',
      'CATI',
      'Plan Features',
      'Income tax and Declarations',
    ],
    customers: 2,
  },
  { name: 'Basic', amount: 720, period: 1, freq: 'Yearly', features: [], customers: 0 },
];

const availableFeatures = [
  'Core HR Solution',
  'Time & Attendance',
  'Approval Management',
  'Employee Facing App',
  'Payroll Management',
  'Income tax and Declarations',
  'CATI',
  'Plan Features',
];

// Popover that closes on outside click
function OrgsPopover({ orgs, open, close }: { orgs: string[]; open: boolean; close: () => void }) {
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
        {orgs.length === 0 && <li className="text-sm text-gray-400">No organizations</li>}
        {orgs.map((org) => (
          <li key={org} className="flex items-center gap-2 py-1 text-sm text-gray-700">
            <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500"></span>
            <span>{org}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlanManagement() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(0);
  const [orgPopoverIdx, setOrgPopoverIdx] = useState<number | null>(null);
  const [newPlan, setNewPlan] = useState<Plan>({
    name: '',
    description: '',
    amount: '',
    period: 1,
    freq: 'Monthly',
    features: [],
    customers: 0,
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featureModalPlanIdx, setFeatureModalPlanIdx] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  console.log('show details', showDetails);

  const handleAddPlan = () => {
    const updatedPlans = [...plans, { ...newPlan, features: [], customers: 0 }];
    setPlans(updatedPlans);
    setShowPlanModal(false);
    setSelectedPlanIdx(updatedPlans.length - 1);
    setFeatureModalPlanIdx(updatedPlans.length - 1);
    setShowFeatureModal(true);
    setSelectedFeatures([]);
  };

  const handlePlanClick = (idx: number) => {
    setSelectedPlanIdx(idx);
    setShowDetails(true);
  };

  const handleAddFeatures = () => {
    setFeatureModalPlanIdx(selectedPlanIdx);
    setSelectedFeatures(plans[selectedPlanIdx]?.features || []);
    setShowFeatureModal(true);
  };

  const handleSaveFeatures = () => {
    if (featureModalPlanIdx === null) return;
    const updatedPlans = [...plans];
    updatedPlans[featureModalPlanIdx].features = [...selectedFeatures];
    setPlans(updatedPlans);
    setShowFeatureModal(false);
    setFeatureModalPlanIdx(null);
    setSelectedFeatures([]);
    setNewPlan({
      name: '',
      description: '',
      amount: '',
      period: 1,
      freq: 'Monthly',
      features: [],
      customers: 0,
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(
      selectedFeatures.includes(feature)
        ? selectedFeatures.filter((f) => f !== feature)
        : [...selectedFeatures, feature],
    );
  };

  const handleDeletePlan = (idx: number) => {
    const updatedPlans = plans.filter((_, i) => i !== idx);
    setPlans(updatedPlans);
    if (selectedPlanIdx === idx) {
      setSelectedPlanIdx(updatedPlans.length > 0 ? 0 : 0);
    }
  };

  const handleDeleteFeature = (featureIdx: number) => {
    const updatedPlans = [...plans];
    updatedPlans[selectedPlanIdx].features = updatedPlans[selectedPlanIdx].features.filter(
      (_, i) => i !== featureIdx,
    );
    setPlans(updatedPlans);
  };

  const selectedPlan = plans[selectedPlanIdx];

  return (
    <div className="flex h-full w-full bg-white">
      {/* LEFT: Plans list */}
      <section className="flex w-1/2 flex-col gap-8 overflow-y-auto border-r border-gray-200 p-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Plans</h1>
          <button
            className="ml-auto rounded-lg bg-teal-500 px-5 py-2 font-semibold text-white transition-all hover:bg-teal-600"
            onClick={() => setShowPlanModal(true)}
          >
            Add custom plan
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {plans.map((plan, idx) => (
            <div
              role="none"
              key={idx}
              onClick={() => handlePlanClick(idx)}
              className={`relative cursor-pointer rounded-2xl border-l-4 px-6 py-5 transition-all ${
                selectedPlanIdx === idx
                  ? 'border border-teal-300/50 border-l-teal-500 bg-cyan-100/40 shadow-md'
                  : 'border border-gray-200/50 border-l-gray-300 bg-gray-50/50 hover:bg-gray-100/30'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="text-lg font-bold text-gray-900">{plan.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlan(idx);
                  }}
                  className="text-gray-400 transition-colors hover:text-red-500"
                  aria-label="Delete Plan"
                  title="Delete plan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Amount: <b className="text-base text-gray-800">₹{plan.amount}</b>
                  </span>
                  <span className="block text-sm font-medium text-gray-600">
                    Plan type: <b className="text-base text-gray-800">{plan.freq}</b>
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Features: <b className="text-base text-gray-800">{plan.features.length}</b>
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
                      {plan.customers}
                    </span>
                    <OrgsPopover
                      orgs={orgsByPlan[idx] || []}
                      open={orgPopoverIdx === idx}
                      close={() => setOrgPopoverIdx(null)}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* RIGHT: Plan details */}
      <section className="flex w-1/2 flex-col gap-6 overflow-y-auto p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">Plan details</h2>
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedPlan && (
          <>
            <div>
              <label className="mb-3 block text-base font-semibold text-gray-700">
                Plan name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPlan.name}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-lg font-medium text-gray-900 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAddFeatures}
              className="w-full rounded-lg border-2 border-cyan-300 bg-cyan-100/30 px-5 py-4 text-base font-semibold text-teal-700 transition-colors hover:bg-cyan-100/50"
            >
              Add new feature →
            </button>

            {selectedPlan.features.length > 0 ? (
              <div className="space-y-3">
                {selectedPlan.features.map((feature, idx) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-gray-300"
                  >
                    <span className="text-base font-medium text-gray-800">{feature}</span>
                    <div className="flex items-center gap-3">
                      <button className="text-gray-400 transition-colors hover:text-teal-600">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="text-gray-400 transition-colors hover:text-red-600"
                        onClick={() => handleDeleteFeature(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h4 className="mb-4 text-base font-semibold text-gray-900">
                  No features are added.
                </h4>
                <button
                  onClick={handleAddFeatures}
                  className="rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-teal-600"
                >
                  Start adding →
                </button>
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
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block font-semibold text-gray-800">Plan description</label>
                <textarea
                  placeholder="e.g. Descriptive text for your plan"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
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
                  value={newPlan.amount}
                  onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
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
                    value={newPlan.period}
                    className="w-1/3 rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                    onChange={(e) => setNewPlan({ ...newPlan, period: +e.target.value })}
                  />
                  <select
                    className="w-2/3 rounded-lg border border-gray-300 bg-white p-4 font-medium focus:ring-2 focus:ring-teal-400/60 focus:outline-none"
                    value={newPlan.freq}
                    onChange={(e) => setNewPlan({ ...newPlan, freq: e.target.value })}
                  >
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
              <button
                className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white transition-all hover:bg-teal-600"
                onClick={handleAddPlan}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Features */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="max-h-[90vh] w-[500px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add new feature</h3>
              <button
                onClick={() => setShowFeatureModal(false)}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-5">
              <label className="mb-2 block font-semibold text-gray-800">Available features</label>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                {availableFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="mb-3 flex cursor-pointer items-center rounded p-2 transition-colors hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="mr-3 h-4 w-4 cursor-pointer rounded text-teal-500 accent-teal-500 focus:ring-teal-400"
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="flex-1 cursor-pointer text-sm font-medium text-gray-800"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-4">
              <button
                className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setShowFeatureModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white transition-all hover:bg-teal-600"
                onClick={handleSaveFeatures}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
