// import { useState, useEffect } from "react";

// interface SubFeatureModalProps {
//   onClose: () => void;
//   onSave: (sf: SubFeature) => void;
//   initial?: SubFeature;          // for editing
//   editMode?: boolean;           // for edit/create distinction
// }
// interface RouteObj {
//   path: string;
//   page: string;
// }
// interface SubFeature {
//   name: string;
//   desc: string;
//   planId: string;
//   routes: RouteObj[];
// }

// export default function SubFeatureModal({ onClose, onSave, initial, editMode }: SubFeatureModalProps) {
//   const [name, setName] = useState(initial?.name || "");
//   const [desc, setDesc] = useState(initial?.desc || "");
//   const [planId, setPlanId] = useState(initial?.planId || "");
//   const [routes, setRoutes] = useState<RouteObj[]>(initial?.routes?.length ? initial.routes : [{ path: "", page: "" }]);

//   useEffect(() => {
//     if (editMode && initial) {
//       setName(initial.name);
//       setDesc(initial.desc);
//       setPlanId(initial.planId);
//       setRoutes(initial.routes);
//     }
//   }, [editMode, initial]);

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     onSave({ name, desc, planId, routes });
//   }

//   return (
//     <div className="fixed inset-0 bg-[rgba(236,240,241,0.7)] flex items-center justify-center z-50">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
//         <h3 className="text-lg font-semibold">{editMode ? "Edit Sub-Feature" : "Add New Sub-Feature"}</h3>
//         <div>
//           <label className="block mb-1">Sub-Feature Name *</label>
//           <input className="w-full border rounded px-3 py-1" value={name} onChange={e => setName(e.target.value)} required />
//         </div>
//         <div>
//           <label className="block mb-1">Description</label>
//           <textarea className="w-full border rounded px-3 py-1" value={desc} onChange={e => setDesc(e.target.value)} />
//         </div>
//         <div>
//           <label className="block mb-1">Razorpay Plan ID *</label>
//           <input className="w-full border rounded px-3 py-1" value={planId} onChange={e => setPlanId(e.target.value)} required />
//         </div>
//         <div>
//           <label className="block mb-1">Feature Routes</label>
//           {routes.map((r, i) => (
//             <div className="flex gap-2 mb-2" key={i}>
//               <input className="border rounded px-2 py-1 flex-1" value={r.path} onChange={e => {
//                 const cp = [...routes]; cp[i].path = e.target.value; setRoutes(cp);
//               }} placeholder="Route" />
//               <input className="border rounded px-2 py-1 flex-1" value={r.page} onChange={e => {
//                 const cp = [...routes]; cp[i].page = e.target.value; setRoutes(cp);
//               }} placeholder="Page" />
//               <button type="button" onClick={() => setRoutes(routes.filter((_, idx) => idx !== i))}>🗑️</button>
//             </div>
//           ))}
//           <button type="button" className="bg-gray-100 px-2 py-1 rounded" onClick={() => setRoutes([...routes, { path: "", page: "" }])}>+ Add Route</button>
//         </div>
//         <div className="flex justify-end gap-2">
//           <button type="button" onClick={onClose} className="bg-gray-100 px-3 py-1 rounded">Cancel</button>
//           <button type="submit" className="bg-teal-600 text-white px-3 py-1 rounded">{editMode ? "Update" : "Create"}</button>
//         </div>
//       </form>
//     </div>
//   );
// }
// import { useState, useEffect } from "react";

import { useEffect, useState } from 'react';

export interface FeatureRoutesObj {
  id?: string | null;
  title?: string;
  routes?: string[];
  pages?: string[];
}

interface SubFeatureModalProps {
  onClose: () => void;
  onSave: (sf: SubFeature) => void;
  initial?: SubFeature;
  editMode?: boolean;
}

export interface SubFeature {
  id?: string; // Sub-feature ID (returned from API, not sent in create)
  title: string;
  descriptions?: string;
  razorpayPlanId?: string; // Only for CREATE mode (not for UPDATE)
  featureRoutes?: FeatureRoutesObj;
}

export default function SubFeatureModal({
  onClose,
  onSave,
  initial,
  editMode,
}: SubFeatureModalProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [descriptions, setDescriptions] = useState(initial?.descriptions || '');
  const [razorpayPlanId, setRazorpayPlanId] = useState(initial?.razorpayPlanId || '');
  const [featureRouteId, setFeatureRouteId] = useState(initial?.featureRoutes?.id || '');
  const [featureRouteTitle, setFeatureRouteTitle] = useState(initial?.featureRoutes?.title || '');
  const [routes, setRoutes] = useState<string[]>(
    initial?.featureRoutes?.routes && initial.featureRoutes.routes.length
      ? initial.featureRoutes.routes
      : [],
  );
  const [pages, setPages] = useState<string[]>(
    initial?.featureRoutes?.pages && initial.featureRoutes.pages.length
      ? initial.featureRoutes.pages
      : [],
  );

  // For CREATE mode: need title and razorpayPlanId
  // For EDIT mode: only need title (razorpayPlanId should not be sent)
  const isValid = title.length > 0 && (!editMode ? razorpayPlanId.length > 0 : true);

  useEffect(() => {
    if (editMode && initial) {
      setTitle(initial.title);
      setDescriptions(initial.descriptions || '');
      setFeatureRouteId(initial.featureRoutes?.id || '');
      setFeatureRouteTitle(initial.featureRoutes?.title || '');
      setRoutes(initial.featureRoutes?.routes || []);
      setPages(initial.featureRoutes?.pages || []);
      // In edit mode, don't set razorpayPlanId since it shouldn't be sent in PATCH request
    }
  }, [editMode, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) {
      const subFeature: SubFeature = {
        title,
        descriptions: descriptions || undefined,
      };

      // Only include razorpayPlanId for CREATE mode (not for UPDATE)
      if (!editMode) {
        subFeature.razorpayPlanId = razorpayPlanId;
      }

      // Include featureRoutes if ANY of its fields have data:
      // - featureRouteId is set
      // - featureRouteTitle is set
      // - routes array has items
      // - pages array has items
      if (featureRouteId || featureRouteTitle || routes.length > 0 || pages.length > 0) {
        subFeature.featureRoutes = {};
        if (featureRouteId) subFeature.featureRoutes.id = featureRouteId;
        if (featureRouteTitle) subFeature.featureRoutes.title = featureRouteTitle;
        // Always include routes and pages as arrays when featureRoutes is included
        subFeature.featureRoutes.routes = routes.length > 0 ? routes : [];
        subFeature.featureRoutes.pages = pages.length > 0 ? pages : [];
      }

      onSave(subFeature);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(34,49,63,0.16)]">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[94vh] min-h-[750px] w-[650px] flex-col gap-8 overflow-y-auto rounded-xl bg-white px-10 py-10 shadow-2xl"
        style={{ boxShadow: '0 3px 48px rgba(0,0,0,0.14)' }}
      >
        <h2 className="mb-2 text-2xl font-bold">
          {editMode ? 'Edit Sub-Feature' : 'Add New Sub-Feature'}
        </h2>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-teal-700">
            Title <span className="font-bold text-red-500">*</span>
          </label>
          <input
            className="w-full border-b border-b-gray-300 bg-[rgba(0,0,0,0.03)] px-2 py-2 text-[1.13rem] font-medium outline-none"
            placeholder="Enter sub-feature title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Description</label>
          <textarea
            className="w-full resize-none border-b border-b-gray-300 bg-[rgba(0,0,0,0.03)] px-2 py-2 text-[1.1rem] outline-none"
            style={{ minHeight: 70 }}
            value={descriptions}
            onChange={(e) => setDescriptions(e.target.value)}
            placeholder="Enter description (optional)"
          />
        </div>

        {/* Razorpay Plan ID - Only for CREATE mode */}
        {!editMode && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-teal-700">
              Razorpay Plan ID <span className="font-bold text-red-500">*</span>
            </label>
            <input
              className="w-full border-b border-b-gray-300 bg-[rgba(0,0,0,0.03)] px-2 py-2 text-[1.11rem] font-medium outline-none"
              value={razorpayPlanId}
              onChange={(e) => setRazorpayPlanId(e.target.value)}
              placeholder="e.g., plan_abc123"
              required={!editMode}
            />
          </div>
        )}

        {/* Sub-Feature ID - Only for EDIT mode (Read-only) */}
        {editMode && initial?.id && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Sub-Feature ID</label>
            <input
              type="text"
              className="w-full border-b border-b-gray-300 bg-[rgba(0,0,0,0.03)] px-2 py-2 text-[1.11rem] font-medium outline-none"
              value={initial.id}
              disabled
              readOnly
            />
          </div>
        )}

        {/* Feature Routes section */}
        <div>
          <div className="mb-4 font-semibold text-gray-700">Feature Routes (Optional)</div>

          {/* Route ID */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">Route ID</label>
            <input
              className="w-full border-b border-b-gray-300 bg-[rgba(0,0,0,0.02)] px-2 py-2 text-base outline-none"
              value={featureRouteId}
              onChange={(e) => setFeatureRouteId(e.target.value)}
              placeholder="e.g., route_123"
            />
          </div>

          {/* Route Title */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-600">Route Title</label>
            <input
              className="w-full border-b border-b-gray-300 bg-[rgba(0,0,0,0.02)] px-2 py-2 text-base outline-none"
              value={featureRouteTitle}
              onChange={(e) => setFeatureRouteTitle(e.target.value)}
              placeholder="e.g., Webhooks"
            />
          </div>

          {/* Routes */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-600">Routes</label>
            {routes.map((route, idx) => (
              <div className="mb-2 flex gap-2" key={idx}>
                <input
                  className="flex-1 border-b border-b-gray-300 bg-[rgba(0,0,0,0.02)] px-2 py-2 text-base outline-none"
                  value={route}
                  onChange={(e) => {
                    const cp = [...routes];
                    cp[idx] = e.target.value;
                    setRoutes(cp);
                  }}
                  placeholder="e.g., /webhooks"
                />
                <button
                  type="button"
                  onClick={() => setRoutes(routes.filter((_, i) => i !== idx))}
                  className="ml-1 text-lg text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-base font-medium text-teal-700"
              onClick={() => setRoutes([...routes, ''])}
            >
              <span className="text-xl font-bold">+</span>
              Add Route
            </button>
          </div>

          {/* Pages */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Pages</label>
            {pages.map((pg, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2">
                <input
                  className="flex-1 border-b border-b-gray-300 bg-[rgba(0,0,0,0.02)] px-2 py-2 text-base outline-none"
                  value={pg}
                  onChange={(e) => {
                    const cp = [...pages];
                    cp[idx] = e.target.value;
                    setPages(cp);
                  }}
                  placeholder="e.g., Webhook Config"
                />
                <button
                  type="button"
                  onClick={() => setPages(pages.filter((_, i) => i !== idx))}
                  className="ml-1 text-lg text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-base font-medium text-teal-700"
              onClick={() => setPages([...pages, ''])}
            >
              <span className="text-xl font-bold">+</span>
              Add Page
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border bg-gray-100 px-8 py-2 text-lg text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`rounded-md border bg-teal-700 px-8 py-2 text-lg text-white ${!isValid ? 'cursor-not-allowed opacity-40' : ''}`}
            disabled={!isValid}
          >
            {editMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
