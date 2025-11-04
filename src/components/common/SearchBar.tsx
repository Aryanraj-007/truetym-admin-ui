'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchBarProps {
  placeholder?: string;
}

function SearchBar({ placeholder = 'Search...' }: Readonly<SearchBarProps>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-half relative max-w-sm">
      <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-gray-500" />
      {mounted && <Input type="search" placeholder={placeholder} className="pr-4 pl-8" />}
    </div>
  );
}

export default SearchBar;
