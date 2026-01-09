

// 'use client';


// export default function UserNav() {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
//         <span className="text-white text-sm font-medium">A</span>
//       </div>
//       <div className="text-right">
//         <p className="text-sm font-medium text-gray-900">Admin User</p>
//         <p className="text-xs text-gray-500">admin@truetym.com</p>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      // If using NextAuth
      // await signOut({ redirect: false });
      
      // Clear any local storage or cookies if needed
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to signup page
      router.push('/signup');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect even if signOut fails
      router.push('/signup');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Admin Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      >
        A
      </button>

      {/* Dropdown Menu - Only visible when isOpen is true */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@trutym.com</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
