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
    status: string;
    role: string;
    employees: Employee[];
  };
}

export default function OrganizationDetail({ organization }: OrganizationDetailProps) {
  const getAvatarColor = (avatar: string) => {
    const colors: { [key: string]: string } = {
      'B': 'bg-cyan-400',
      'J': 'bg-cyan-300',
      'K': 'bg-cyan-500'
    };
    return colors[avatar] || 'bg-gray-400';
  };

  return (
    <div>
      {/* Organization Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-600">{organization.email}</span>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                organization.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {organization.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {organization.role}
            </span>
          </div>
        </div>
        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm">
          Add Employee
        </button>
      </div>

      {/* Employees Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500 mt-1">{organization.employees.length} team members</p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organization.employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(employee.avatar)} flex items-center justify-center text-white font-medium`}>
                      {employee.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{employee.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{employee.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {employee.status}
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
