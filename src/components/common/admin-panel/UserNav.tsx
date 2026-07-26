'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_ROLE_LABELS, AdminRole } from '@/constants/admin-role';
import { clearAuthUser, selectAuthUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';
import { LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

function roleLabel(role?: AdminRole | null): string {
  return role ? ADMIN_ROLE_LABELS[role] : 'Admin';
}

// ─── component ───────────────────────────────────────────────────────────────

export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);

  // Derived display values — fall back gracefully if Redux not yet hydrated
  const displayName = user?.name || 'Admin';
  const displayEmail = user?.email || 'admin@truetym.com';
  const displayRole = roleLabel(user?.role);
  // First letter of first word, uppercase
  const initial = displayName.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      // Clear Redux state + sessionStorage
      dispatch(clearAuthUser());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 font-semibold text-white transition-colors hover:bg-teal-600 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:outline-none"
        title={displayName}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* User info */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 font-semibold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="truncate text-xs text-gray-500">{displayEmail}</p>
                {/* Role badge */}
                <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 ring-1 ring-teal-600/20">
                  {displayRole}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
