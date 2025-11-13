
'use client';

import { Bell } from 'lucide-react';
import SearchBar from './SearchBar';
import UserNav from './UserNav';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <SearchBar/>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <UserNav />
      </div>
    </header>
  );
}
