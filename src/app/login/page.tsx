'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { countryCodeMap } from '@/constants/country';
import { setAuthUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';
import { isValidPhoneNumber } from '@/utils/valid-phone-number';
import { useDispatch } from 'react-redux';

import { loginWithPassword, sendOtp, verifyOtp } from '@/lib/login';
import SignUpCarousel from '@/components/admin-panel/SignUpCarousel';
import CountryCodeSelect from '@/components/common/CountryCodeSelect';
import OTPInput from '@/components/common/OTPInput';
import PhoneInput from '@/components/common/PhoneInput';

// ─── geo-detect country code ─────────────────────────────────────────────────

async function detectUserCountryCode(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Geolocation API failed');
    const data = await response.json();
    const countryCode = data?.country_code?.toUpperCase();
    if (countryCode && countryCodeMap[countryCode]) return countryCodeMap[countryCode];
  } catch (error) {
    console.error('Error detecting country:', error);
  }
  return '+91';
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Pull user profile fields out of whatever shape the backend returns.
 * Adjust field names if your API returns something different.
 */
function extractUserFromResponse(data: any) {
  const user = data?.data?.user ?? data?.user ?? data?.data ?? {};
  return {
    id: String(user.id ?? user._id ?? ''),
    name: user.name ?? user.full_name ?? user.username ?? 'Admin',
    email: user.email ?? '',
    phone: user.phone ?? user.phoneNumber ?? '',
    role: user.role ?? user.adminRole ?? 'admin',
    accessToken: data?.data?.accessToken ?? data?.accessToken ?? '',
  };
}

type LoginMode = 'password' | 'otp';

// ─── component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [mode, setMode] = useState<LoginMode>('password');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [rememberMe, setRememberMe] = useState(false);

  // Password-mode state
  const [password, setPassword] = useState('');
  const [passwordLoginError, setPasswordLoginError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // OTP-mode state
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [userId, setUserId] = useState<string | null>(null);
  const [sendOTPError, setSendOTPError] = useState<string | null>(null);
  const [verifyOTPError, setVerifyOTPError] = useState<string | null>(null);

  useEffect(() => {
    detectUserCountryCode().then(setCountryCode);
  }, []);

  // Shared post-login step — sets cookie then redirects
  const finishLogin = async (token: string | undefined, redirectUrl?: string) => {
    try {
      await fetch('/api/auth/verify-otp-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Continue even if cookie setting fails
    }
    router.push(redirectUrl || '/dashboard');
  };

  // ── Password login ──────────────────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    setPasswordLoginError(null);

    if (!isValidPhoneNumber(phoneNumber)) {
      setPasswordLoginError('Please enter a valid phone number');
      return;
    }
    if (!password) {
      setPasswordLoginError('Please enter your password');
      return;
    }

    setIsSubmittingPassword(true);

    const data = await loginWithPassword({ dialCode: countryCode, phoneNumber, password });

    if (data?.succeeded === true) {
      // ✅ Store user info (including role) in Redux + sessionStorage
      dispatch(setAuthUser(extractUserFromResponse(data)));
      await finishLogin(data?.data?.accessToken, (data as any)?.redirectUrl);
    } else {
      const errorMsg = Array.isArray(data?.message)
        ? data.message[0]
        : (data as any)?.message || 'Login failed. Please check your credentials.';
      setPasswordLoginError(errorMsg);
    }

    setIsSubmittingPassword(false);
  };

  // ── OTP login ───────────────────────────────────────────────────────────────
  const handleSendOTP = () => {
    if (phoneNumber.length >= 10) {
      setSendOTPError(null);
      (async () => {
        const data = await sendOtp({ phoneNumber: Number(phoneNumber), dialCode: countryCode });

        if (data?.succeeded === true) {
          const extractedUserId =
            (data as any)?.userId ||
            (data as any)?.user_id ||
            (data as any)?.id ||
            (data as any)?._id ||
            data?.data?.userId ||
            (data as any)?.user?._id ||
            (data as any)?.user?.id;

          if (extractedUserId) {
            setUserId(String(extractedUserId));
            try {
              sessionStorage.setItem('loginUserId', String(extractedUserId));
            } catch {
              /* ignore */
            }
          }

          setStep('otp');
        } else {
          const errorMsg = Array.isArray(data?.message)
            ? data.message[0]
            : (data as any)?.message || 'Failed to send OTP. Please try again.';
          setSendOTPError(errorMsg);
        }
      })();
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    const effectiveUserId =
      userId || (typeof window !== 'undefined' && sessionStorage.getItem('loginUserId'));
    if (!effectiveUserId) {
      setVerifyOTPError('Missing userId. Please resend OTP and try again.');
      return false;
    }

    setVerifyOTPError(null);

    const data = await verifyOtp({ otp, userId: effectiveUserId });

    if (data?.succeeded === true) {
      // ✅ Store user info (including role) in Redux + sessionStorage
      dispatch(setAuthUser(extractUserFromResponse(data)));
      await finishLogin(data?.data?.accessToken, (data as any)?.redirectUrl);
      return true;
    } else {
      const errorMsg = Array.isArray(data?.message)
        ? data.message[0]
        : (data as any)?.message || 'OTP verification failed';
      setVerifyOTPError(errorMsg);
      return false;
    }
  };

  const handleGoBack = () => setStep('phone');

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setPasswordLoginError(null);
    setSendOTPError(null);
    setVerifyOTPError(null);
    setStep('phone');
  };

  // ── render ──────────────────────────────────────────────────────────────────
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
          </div>

          {mode === 'password' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Phone number"
                />
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Password"
              />

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                {''}
                Remember me
              </label>

              {passwordLoginError && <p className="text-sm text-red-600">{passwordLoginError}</p>}

              <button
                onClick={handlePasswordLogin}
                disabled={isSubmittingPassword}
                className="w-full rounded-lg bg-teal-600 py-2.5 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmittingPassword ? 'Logging in...' : 'Log in'}
              </button>

              <p className="text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => switchMode('otp')}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Log in with OTP instead
                </button>
              </p>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="font-medium text-teal-700">
                  Sign up
                </a>
              </p>
            </div>
          ) : step === 'phone' ? (
            <>
              <PhoneInput
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                onSendOTP={handleSendOTP}
                error={sendOTPError}
              />
              <p className="mt-4 text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Log in with password instead
                </button>
              </p>
            </>
          ) : (
            <OTPInput
              phoneNumber={`${countryCode} ${phoneNumber}`}
              onVerify={handleVerifyOTP}
              onGoBack={handleGoBack}
              error={verifyOTPError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
