'use client';

import { Bell } from 'lucide-react';

import SearchBar from '@/components/common/SearchBar';
import UserNav from '@/components/shared/UserNav';

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <SearchBar />

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 transition-colors hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <UserNav />
      </div>
    </header>
  );
}
