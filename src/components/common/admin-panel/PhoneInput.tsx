'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  const countries = [
    { code: '+91', name: 'IN', country: 'India' },
    { code: '+1', name: 'US', country: 'United States' },
  ];

  const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];

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
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <span className="font-medium">{selectedCountry.name}</span>
              <span className="text-gray-600">{selectedCountry.code}</span>
              <svg
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
              <div className="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setCountryCode(country.code);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex-1 text-left font-medium">{country.country}</span>
                    <span className="text-gray-600">{country.code}</span>
                  </button>
                ))}
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
