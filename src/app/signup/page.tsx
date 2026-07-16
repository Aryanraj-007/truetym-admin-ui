'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { countryCodeMap } from '@/constants/country';
import {
  generateStrongPassword,
  getPasswordChecklist,
  isPasswordStrongEnough,
} from '@/utils/password';
import { isValidPhoneNumber } from '@/utils/valid-phone-number';

import { signUp } from '@/lib/login';
import CountryCodeSelect from '@/components/common/admin-panel/CountryCodeSelect';
import SignUpCarousel from '@/components/common/admin-panel/SignUpCarousel';

async function detectUserCountryCode(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Geolocation API failed');

    const data = await response.json();
    const countryCode = data?.country_code?.toUpperCase();

    if (countryCode && countryCodeMap[countryCode]) {
      return countryCodeMap[countryCode];
    }
  } catch (error) {
    console.error('Error detecting country:', error);
  }

  return '+91';
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    detectUserCountryCode().then(setCountryCode);
  }, []);

  const passwordChecklist = getPasswordChecklist(password);

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword();
    setPassword(generated);
    setConfirmPassword(generated);
    // Reveal it immediately so the user can actually see/copy what was
    // generated, instead of staring at two rows of dots.
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your name';
    if (!isValidPhoneNumber(phoneNumber)) return 'Please enter a valid phone number';

    if (!email.trim()) return 'Please enter your email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address';
    }

    if (!isPasswordStrongEnough(password)) {
      return 'Password does not meet the minimum strength requirements below';
    }
    if (password !== confirmPassword) return 'Passwords do not match';

    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    const data = await signUp({
      name: name.trim(),
      dialCode: countryCode,
      phoneNumber,
      email: email.trim(),
      password,
    });

    if (data?.succeeded === true) {
      setSuccessMessage(
        Array.isArray(data?.message)
          ? data.message[0]
          : 'Signup successful. Your account is pending approval.',
      );
      setName('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      const errorMsg = Array.isArray(data?.message)
        ? data.message[0]
        : (data as any)?.message || 'Signup failed. Please try again.';
      setError(errorMsg);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden bg-linear-to-br from-teal-500 to-teal-700 lg:flex lg:w-1/2">
        <SignUpCarousel />
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/logo1.png"
                alt="TrueTym Logo"
                width={200}
                height={120}
                className="h-auto w-auto"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Create an admin account</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Phone number"
                />
              </div>
              {phoneNumber.length > 0 && !isValidPhoneNumber(phoneNumber) && (
                <p className="mt-1 text-xs text-red-600">Enter 10-15 digits, numbers only</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="you@company.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for logging in with email and for password reset links.
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs font-medium text-teal-700 hover:underline"
                >
                  Suggest strong password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Live checklist — this is the "best practice" enforcement
                  instead of a single blanket error message, so the user
                  can see exactly what's still missing as they type. */}
              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {passwordChecklist.map((rule) => (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        rule.passed ? 'text-teal-700' : 'text-gray-400'
                      }`}
                    >
                      <span>{rule.passed ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-teal-700">{successMessage}</p>}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-teal-600 py-2.5 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-teal-700">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
