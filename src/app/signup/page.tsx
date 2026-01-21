'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import OTPInput from '@/components/common/admin-panel/OTPInput';
import PhoneInput from '@/components/common/admin-panel/PhoneInput';
import SignUpCarousel from '@/components/common/admin-panel/SignUpCarousel';

// Country code mapping
const countryCodeMap: Record<string, string> = {
  IN: '+91', // India
  US: '+1', // United States
  GB: '+44', // United Kingdom
  CA: '+1', // Canada
  AU: '+61', // Australia
  NZ: '+64', // New Zealand
  SG: '+65', // Singapore
  PK: '+92', // Pakistan
  BD: '+880', // Bangladesh
  LK: '+94', // Sri Lanka
  MY: '+60', // Malaysia
  TH: '+66', // Thailand
  PH: '+63', // Philippines
  ID: '+62', // Indonesia
  VN: '+84', // Vietnam
  DE: '+49', // Germany
  FR: '+33', // France
  IT: '+39', // Italy
  ES: '+34', // Spain
  PT: '+351', // Portugal
  NL: '+31', // Netherlands
  BE: '+32', // Belgium
  CH: '+41', // Switzerland
  AT: '+43', // Austria
  SE: '+46', // Sweden
  NO: '+47', // Norway
  DK: '+45', // Denmark
  FI: '+358', // Finland
  PL: '+48', // Poland
  CZ: '+420', // Czech Republic
  HU: '+36', // Hungary
  RO: '+40', // Romania
  GR: '+30', // Greece
  TR: '+90', // Turkey
  AE: '+971', // United Arab Emirates
  SA: '+966', // Saudi Arabia
  QA: '+974', // Qatar
  KW: '+965', // Kuwait
  BH: '+973', // Bahrain
  OM: '+968', // Oman
  JO: '+962', // Jordan
  IL: '+972', // Israel
  EG: '+20', // Egypt
  NG: '+234', // Nigeria
  ZA: '+27', // South Africa
  KE: '+254', // Kenya
  JP: '+81', // Japan
  KR: '+82', // South Korea
  CN: '+86', // China
  HK: '+852', // Hong Kong
  TW: '+886', // Taiwan
  BR: '+55', // Brazil
  MX: '+52', // Mexico
  AR: '+54', // Argentina
  CL: '+56', // Chile
  CO: '+57', // Colombia
  PE: '+51', // Peru
  RU: '+7', // Russia
  UA: '+380', // Ukraine
};

async function detectUserCountryCode(): Promise<string> {
  try {
    // Try using ipapi.co for geolocation
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        Accept: 'application/json',
      },
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

  // Fallback to India if detection fails
  return '+91';
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sendOTPError, setSendOTPError] = useState<string | null>(null);
  const [verifyOTPError, setVerifyOTPError] = useState<string | null>(null);

  // Detect user's country code on component mount
  useEffect(() => {
    const detectLocation = async () => {
      const detectedCode = await detectUserCountryCode();
      setCountryCode(detectedCode);
    };

    detectLocation();
  }, []);

  const handleSendOTP = () => {
    if (phoneNumber.length >= 10) {
      setSendOTPError(null);
      // call send-otp API
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_TRUETYM_ADMIN_URL}/identity/send-otp`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: Number(phoneNumber), dialCode: countryCode }),
            },
          );

          const data = await res.json();

          // Check 'succeeded' field to determine success or failure
          if (data?.succeeded === true) {
            // expect API to return a userId or similar; try common fields
            const extractedUserId =
              data?.userId ||
              data?.user_id ||
              data?.id ||
              data?._id ||
              data?.data?.userId ||
              data?.user?._id ||
              data?.user?.id;

            if (extractedUserId) {
              setUserId(String(extractedUserId));
              try {
                sessionStorage.setItem('signupUserId', String(extractedUserId));
              } catch {
                // ignore storage errors
              }
            }

            setStep('otp');
          } else {
            // Extract error message from response
            const errorMsg = Array.isArray(data?.message)
              ? data.message[0]
              : data?.message || 'Failed to send OTP. Please try again.';
            setSendOTPError(errorMsg);
          }
        } catch {
          // network or other error
          setSendOTPError('Unable to send OTP. Please try again.');
        }
      })();
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    // allow fallback to sessionStorage in case state was lost
    const effectiveUserId =
      userId || (typeof window !== 'undefined' && sessionStorage.getItem('signupUserId'));
    if (!effectiveUserId) {
      setVerifyOTPError('Missing userId. Please resend OTP and try again.');
      return false;
    }

    setVerifyOTPError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_TRUETYM_ADMIN_URL}/identity/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, userId: effectiveUserId }),
      });

      const data = await res.json();

      // Check 'succeeded' field in response body, not HTTP status
      if (data?.succeeded === true) {
        // Extract accessToken from data.accessToken (per API response structure)
        const token = data?.data?.accessToken;

        if (token) {
          try {
            localStorage.setItem('authToken', String(token));
          } catch {
            // ignore storage errors
          }
        }

        // Set OTP verification cookie via API call
        try {
          await fetch('/api/auth/verify-otp-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch {
          // Continue even if cookie setting fails
        }

        // API succeeded — navigate according to response or default to dashboard
        if (data?.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          router.push('/dashboard');
        }

        return true;
      } else {
        // Extract error message from response
        const errorMsg = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message || 'OTP verification failed';
        setVerifyOTPError(errorMsg);
        return false;
      }
    } catch {
      setVerifyOTPError('Unable to verify OTP. Please try again.');
      return false;
    }
  };

  const handleGoBack = () => {
    setStep('phone');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Carousel */}
      <div className="hidden bg-gradient-to-br from-teal-500 to-teal-700 lg:flex lg:w-1/2">
        <SignUpCarousel />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="mb-12 text-center">
            {/* Logo Image - Large Size */}
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

          {/* Form Content */}
          {step === 'phone' ? (
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
