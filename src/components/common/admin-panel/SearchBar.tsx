// 'use client';
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="relative w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search customers, metrics, reports..."
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}