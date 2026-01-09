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

import { useState, useEffect } from "react";

interface SubFeatureModalProps {
  onClose: () => void;
  onSave: (sf: SubFeature) => void;
  initial?: SubFeature;
  editMode?: boolean;
}
interface RouteObj {
  path: string;
  page: string;
}
interface SubFeature {
  name: string;
  desc: string;
  planId: string;
  routes: RouteObj[];
  pages?: string[];
}

export default function SubFeatureModal({
  onClose,
  onSave,
  initial,
  editMode,
}: SubFeatureModalProps) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [planId, setPlanId] = useState(initial?.planId || "");
  const [routes, setRoutes] = useState<RouteObj[]>(
    initial?.routes && initial.routes.length ? initial.routes : []
  );
  const [pages, setPages] = useState<string[]>(
    initial?.pages && initial.pages.length ? initial.pages : []
  );

  const isValid = name.length > 0 && planId.length > 0;

  useEffect(() => {
    if (editMode && initial) {
      setName(initial.name);
      setDesc(initial.desc);
      setPlanId(initial.planId);
      setRoutes(initial.routes || []);
      setPages(initial.pages || []);
    }
  }, [editMode, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) {
      onSave({ name, desc, planId, routes, pages });
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(34,49,63,0.16)] flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl w-[650px] min-h-[750px] max-h-[94vh] px-10 py-10 flex flex-col gap-8 overflow-y-auto"
        style={{ boxShadow: "0 3px 48px rgba(0,0,0,0.14)" }}
      >
        <h2 className="font-bold text-2xl mb-2">Add New Sub-Feature</h2>

        {/* Sub-feature name */}
        <div>
          <label className="text-teal-700 text-sm font-semibold mb-1 block">
            Sub-Feature Name <span className="text-teal-400 font-bold">**</span>
          </label>
          <input
            className="w-full border-b border-b-gray-300 outline-none px-2 py-2 text-[1.13rem] font-medium bg-[rgba(0,0,0,0.03)]"
            placeholder="Enter sub-feature name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-600 text-sm mb-1 block font-medium">Description</label>
          <textarea
            className="w-full border-b border-b-gray-300 outline-none px-2 py-2 text-[1.1rem] bg-[rgba(0,0,0,0.03)] resize-none"
            style={{ minHeight: 70 }}
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Razorpay Plan ID */}
        <div>
          <label className="text-teal-700 text-sm font-semibold mb-1 block">
            Razorpay Plan ID <span className="text-teal-400 font-bold">**</span>
          </label>
          <input
            className="w-full border-b border-b-gray-300 outline-none px-2 py-2 text-[1.11rem] font-medium bg-[rgba(0,0,0,0.03)]"
            value={planId}
            onChange={e => setPlanId(e.target.value)}
            required
          />
        </div>

        {/* Feature Routes section */}
        <div>
          <div className="text-gray-700 font-semibold mb-2">Feature Routes</div>
          {routes.map((route, idx) => (
            <div className="flex gap-2 mb-2" key={idx}>
              <input
                className="border-b border-b-gray-300 outline-none px-2 py-2 flex-1 text-base bg-[rgba(0,0,0,0.02)]"
                value={route.path}
                onChange={e => {
                  const cp = [...routes];
                  cp[idx].path = e.target.value;
                  setRoutes(cp);
                }}
                placeholder="Route ID (optional)"
              />
              <input
                className="border-b border-b-gray-300 outline-none px-2 py-2 flex-1 text-base bg-[rgba(0,0,0,0.02)]"
                value={route.page}
                onChange={e => {
                  const cp = [...routes];
                  cp[idx].page = e.target.value;
                  setRoutes(cp);
                }}
                placeholder="Route Title (optional)"
              />
              <button
                type="button"
                onClick={() => setRoutes(routes.filter((_, i) => i !== idx))}
                className="ml-1 text-lg text-gray-400 hover:text-teal-700"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center text-teal-700 text-base font-medium gap-1 mt-2"
            onClick={() => setRoutes([...routes, { path: "", page: "" }])}
          >
            <span className="font-bold text-xl">+</span>
            Add Route
          </button>
        </div>

        {/* Pages section */}
        <div>
          <div className="text-gray-700 font-semibold mb-2">Pages</div>
          {pages.map((pg, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                className="border-b border-b-gray-300 outline-none px-2 py-2 flex-1 text-base bg-[rgba(0,0,0,0.02)]"
                value={pg}
                onChange={e => {
                  const cp = [...pages];
                  cp[idx] = e.target.value;
                  setPages(cp);
                }}
                placeholder="Page"
              />
              <button
                type="button"
                onClick={() => setPages(pages.filter((_, i) => i !== idx))}
                className="ml-1 text-lg text-gray-400 hover:text-teal-700"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center text-teal-700 text-base font-medium gap-1 mt-2"
            onClick={() => setPages([...pages, ""])}
          >
            <span className="font-bold text-xl">+</span>
            Add Page
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-8 py-2 rounded-md border text-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-8 py-2 rounded-md border text-white bg-teal-700 text-lg ${!isValid ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={!isValid}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
