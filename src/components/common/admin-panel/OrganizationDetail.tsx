// 'use client';

// interface Employee {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   status: string;
//   avatar: string;
// }

// interface OrganizationDetailProps {
//   organization: {
//     name: string;
//     email: string;
//     status?: string;
//     role?: string;
//     employees: Employee[];
//   };
// }

// export default function OrganizationDetail({
//   organization,
// }: Readonly<OrganizationDetailProps | any>) {
//   const getAvatarColor = (avatar: string) => {
//     const colors: { [key: string]: string } = {
//       B: 'bg-cyan-400',
//       J: 'bg-cyan-300',
//       K: 'bg-cyan-500',
//     };
//     return colors[avatar] || 'bg-gray-400';
//   };

//   return (
//     <div>
//       {/* Organization Header */}
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
//           <div className="mt-2 flex items-center gap-3">
//             <span className="text-sm text-gray-600">{organization.email}</span>
//             <span
//               className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                 organization.status === 'Active'
//                   ? 'bg-green-100 text-green-800'
//                   : 'bg-red-100 text-red-800'
//               }`}
//             >
//               {organization.status}
//             </span>
//             <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
//               {organization.role}
//             </span>
//           </div>
//         </div>
//         <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600">
//           Add Employee
//         </button>
//       </div>

//       {/* Employees Section */}
//       <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
//         <div className="border-b border-gray-200 p-6">
//           <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
//           <p className="mt-1 text-sm text-gray-500">{organization.employees.length} team members</p>
//         </div>

//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
//                 Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
//                 Email
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
//                 Role
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
//                 Status
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {organization.employees.map((employee: Employee) => (
//               <tr key={employee.id} className="transition-colors hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`h-10 w-10 rounded-full ${getAvatarColor(employee.avatar)} flex items-center justify-center font-medium text-white`}
//                     >
//                       {employee.avatar}
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">{employee.name}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm text-gray-600">{employee.email}</span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm text-gray-600">{employee.role}</span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                       employee.status === 'Active'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}
//                   >
//                     {employee.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

'use client';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}

interface OrganizationDetailProps {
  organization: {
    name: string;
    email: string;
    status?: string;
    role?: string;
    employees: Employee[];
  };
}

export default function OrganizationDetail({ organization }: OrganizationDetailProps) {
  const getAvatarColor = (avatar: string) => {
    const colors: Record<string, string> = {
      B: 'bg-cyan-400',
      J: 'bg-cyan-300',
      K: 'bg-cyan-500',
    };
    return colors[avatar] ?? 'bg-gray-400';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm text-gray-600">{organization.email}</span>

            {organization.status && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  organization.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {organization.status}
              </span>
            )}

            {organization.role && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {organization.role}
              </span>
            )}
          </div>
        </div>

        <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600">
          Add Employee
        </button>
      </div>

      {/* Employees */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Employees</h2>
          <p className="text-sm text-gray-500">{organization.employees.length} team members</p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {organization.employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full ${getAvatarColor(
                        emp.avatar,
                      )} flex items-center justify-center text-white`}
                    >
                      {emp.avatar}
                    </div>
                    <span className="font-medium">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      emp.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
