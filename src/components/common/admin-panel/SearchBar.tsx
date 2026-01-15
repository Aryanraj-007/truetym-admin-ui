// 'use client';
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="relative w-96">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search customers, metrics, reports..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none"
      />
    </div>
  );
}
