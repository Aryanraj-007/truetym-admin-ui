

'use client';


export default function UserNav() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
        <span className="text-white text-sm font-medium">A</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">Admin User</p>
        <p className="text-xs text-gray-500">admin@truetym.com</p>
      </div>
    </div>
  );
}
