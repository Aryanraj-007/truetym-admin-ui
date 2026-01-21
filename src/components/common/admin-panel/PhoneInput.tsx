'use client';

import { useState } from 'react';
import Link from 'next/link';

import 'flag-icons/css/flag-icons.min.css';

interface PhoneInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  onSendOTP: () => void;
  error?: string | null;
}

interface Country {
  code: string;
  name: string;
  country: string;
  countryCodeAlpha: string;
}

const FlagEmoji = ({ code }: { code: string }) => {
  // Convert country code to lowercase for flag-icons
  const countryCode = code.toLowerCase();

  return (
    <span className={`fi fi-${countryCode} text-2xl`} style={{ aspectRatio: '1.5 / 1' }}></span>
  );
};

export default function PhoneInput({
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
  rememberMe,
  setRememberMe,
  onSendOTP,
  error,
}: PhoneInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const countries: Country[] = [
    { code: '+91', name: 'IN', country: 'India', countryCodeAlpha: 'IN' },
    { code: '+1', name: 'US', country: 'United States', countryCodeAlpha: 'US' },
    { code: '+44', name: 'GB', country: 'United Kingdom', countryCodeAlpha: 'GB' },
    { code: '+1', name: 'CA', country: 'Canada', countryCodeAlpha: 'CA' },
    { code: '+61', name: 'AU', country: 'Australia', countryCodeAlpha: 'AU' },
    { code: '+64', name: 'NZ', country: 'New Zealand', countryCodeAlpha: 'NZ' },
    { code: '+65', name: 'SG', country: 'Singapore', countryCodeAlpha: 'SG' },
    { code: '+92', name: 'PK', country: 'Pakistan', countryCodeAlpha: 'PK' },
    { code: '+880', name: 'BD', country: 'Bangladesh', countryCodeAlpha: 'BD' },
    { code: '+94', name: 'LK', country: 'Sri Lanka', countryCodeAlpha: 'LK' },
    { code: '+60', name: 'MY', country: 'Malaysia', countryCodeAlpha: 'MY' },
    { code: '+66', name: 'TH', country: 'Thailand', countryCodeAlpha: 'TH' },
    { code: '+63', name: 'PH', country: 'Philippines', countryCodeAlpha: 'PH' },
    { code: '+62', name: 'ID', country: 'Indonesia', countryCodeAlpha: 'ID' },
    { code: '+84', name: 'VN', country: 'Vietnam', countryCodeAlpha: 'VN' },
    { code: '+49', name: 'DE', country: 'Germany', countryCodeAlpha: 'DE' },
    { code: '+33', name: 'FR', country: 'France', countryCodeAlpha: 'FR' },
    { code: '+39', name: 'IT', country: 'Italy', countryCodeAlpha: 'IT' },
    { code: '+34', name: 'ES', country: 'Spain', countryCodeAlpha: 'ES' },
    { code: '+351', name: 'PT', country: 'Portugal', countryCodeAlpha: 'PT' },
    { code: '+31', name: 'NL', country: 'Netherlands', countryCodeAlpha: 'NL' },
    { code: '+32', name: 'BE', country: 'Belgium', countryCodeAlpha: 'BE' },
    { code: '+41', name: 'CH', country: 'Switzerland', countryCodeAlpha: 'CH' },
    { code: '+43', name: 'AT', country: 'Austria', countryCodeAlpha: 'AT' },
    { code: '+46', name: 'SE', country: 'Sweden', countryCodeAlpha: 'SE' },
    { code: '+47', name: 'NO', country: 'Norway', countryCodeAlpha: 'NO' },
    { code: '+45', name: 'DK', country: 'Denmark', countryCodeAlpha: 'DK' },
    { code: '+358', name: 'FI', country: 'Finland', countryCodeAlpha: 'FI' },
    { code: '+48', name: 'PL', country: 'Poland', countryCodeAlpha: 'PL' },
    { code: '+420', name: 'CZ', country: 'Czech Republic', countryCodeAlpha: 'CZ' },
    { code: '+36', name: 'HU', country: 'Hungary', countryCodeAlpha: 'HU' },
    { code: '+40', name: 'RO', country: 'Romania', countryCodeAlpha: 'RO' },
    { code: '+30', name: 'GR', country: 'Greece', countryCodeAlpha: 'GR' },
    { code: '+90', name: 'TR', country: 'Turkey', countryCodeAlpha: 'TR' },
    { code: '+971', name: 'AE', country: 'United Arab Emirates', countryCodeAlpha: 'AE' },
    { code: '+966', name: 'SA', country: 'Saudi Arabia', countryCodeAlpha: 'SA' },
    { code: '+974', name: 'QA', country: 'Qatar', countryCodeAlpha: 'QA' },
    { code: '+965', name: 'KW', country: 'Kuwait', countryCodeAlpha: 'KW' },
    { code: '+973', name: 'BH', country: 'Bahrain', countryCodeAlpha: 'BH' },
    { code: '+968', name: 'OM', country: 'Oman', countryCodeAlpha: 'OM' },
    { code: '+962', name: 'JO', country: 'Jordan', countryCodeAlpha: 'JO' },
    { code: '+972', name: 'IL', country: 'Israel', countryCodeAlpha: 'IL' },
    { code: '+20', name: 'EG', country: 'Egypt', countryCodeAlpha: 'EG' },
    { code: '+234', name: 'NG', country: 'Nigeria', countryCodeAlpha: 'NG' },
    { code: '+27', name: 'ZA', country: 'South Africa', countryCodeAlpha: 'ZA' },
    { code: '+254', name: 'KE', country: 'Kenya', countryCodeAlpha: 'KE' },
    { code: '+81', name: 'JP', country: 'Japan', countryCodeAlpha: 'JP' },
    { code: '+82', name: 'KR', country: 'South Korea', countryCodeAlpha: 'KR' },
    { code: '+86', name: 'CN', country: 'China', countryCodeAlpha: 'CN' },
    { code: '+852', name: 'HK', country: 'Hong Kong', countryCodeAlpha: 'HK' },
    { code: '+886', name: 'TW', country: 'Taiwan', countryCodeAlpha: 'TW' },
    { code: '+55', name: 'BR', country: 'Brazil', countryCodeAlpha: 'BR' },
    { code: '+52', name: 'MX', country: 'Mexico', countryCodeAlpha: 'MX' },
    { code: '+54', name: 'AR', country: 'Argentina', countryCodeAlpha: 'AR' },
    { code: '+56', name: 'CL', country: 'Chile', countryCodeAlpha: 'CL' },
    { code: '+57', name: 'CO', country: 'Colombia', countryCodeAlpha: 'CO' },
    { code: '+51', name: 'PE', country: 'Peru', countryCodeAlpha: 'PE' },
    { code: '+7', name: 'RU', country: 'Russia', countryCodeAlpha: 'RU' },
    { code: '+380', name: 'UA', country: 'Ukraine', countryCodeAlpha: 'UA' },
  ];

  // Remove duplicates and sort by country name
  const uniqueCountries = Array.from(
    new Map(countries.map((item) => [item.country, item])).values(),
  ).sort((a, b) => a.country.localeCompare(b.country));

  const selectedCountry = uniqueCountries.find((c) => c.code === countryCode) || uniqueCountries[0];

  // Filter countries based on search query
  const filteredCountries = uniqueCountries.filter(
    (country) =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery) ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-600">Enter your mobile number to get started </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Mobile Number Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Mobile Number</label>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                {/* Search Input */}
                <div className="sticky top-0 rounded-t-lg border-b border-gray-200 bg-white p-2">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Countries List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={`${country.code}-${country.country}`}
                        type="button"
                        onClick={() => {
                          setCountryCode(country.code);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50"
                      >
                        <FlagEmoji code={country.countryCodeAlpha} />
                        <span className="flex-1 text-left font-medium">{country.country}</span>
                        <span className="font-semibold text-gray-700">{country.code}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter mobile number"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none"
            maxLength={10}
          />
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
          Remember me
        </label>
      </div>

      {/* Send OTP Button */}
      <button
        onClick={onSendOTP}
        disabled={phoneNumber.length < 10}
        className="w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Send OTP
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-4 text-gray-500">OR</span>
        </div>
      </div>

      {/* Passkey Sign In */}
      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        <span className="font-medium text-gray-700">Sign in with Passkey</span>
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-teal-600 hover:text-teal-700">
          Sign in here
        </Link>
      </p>

      {/* Terms and Privacy */}
      <p className="text-center text-xs text-gray-500">
        <Link href="/terms" className="hover:text-gray-700">
          Terms of Service
        </Link>
        {' • '}
        <Link href="/privacy" className="hover:text-gray-700">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
