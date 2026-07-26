'use client';

import { useEffect, useRef, useState } from 'react';

import 'flag-icons/css/flag-icons.min.css';

import { Country, uniqueCountries } from '@/constants/country';

interface CountryCodeSelectProps {
  value: string; // current dial code, e.g. '+91'
  onChange: (dialCode: string) => void;
  className?: string;
}

const FlagEmoji = ({ code }: { code: string }) => {
  const countryCode = code.toLowerCase();
  return (
    <span className={`fi fi-${countryCode} text-2xl`} style={{ aspectRatio: '1.5 / 1' }}></span>
  );
};

export default function CountryCodeSelect({
  value,
  onChange,
  className,
}: Readonly<CountryCodeSelectProps>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = uniqueCountries.find((c) => c.code === value) || uniqueCountries[0];

  const filteredCountries = uniqueCountries.filter(
    (country) =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery) ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Close on outside click so it behaves like a normal select across all
  // three forms, without each page having to wire this up separately.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country.code);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
      >
        <FlagEmoji code={selectedCountry.countryCodeAlpha} />
        <span className="text-sm font-medium">{selectedCountry.name}</span>
        <span className="text-gray-600">{selectedCountry.code}</span>
        <svg
          className={`ml-auto h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 z-10 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="sticky top-0 rounded-t-lg border-b border-gray-200 bg-white p-2">
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.country}`}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <FlagEmoji code={country.countryCodeAlpha} />
                  <span className="flex-1 text-left font-medium">{country.country}</span>
                  <span className="font-semibold text-gray-700">{country.code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
