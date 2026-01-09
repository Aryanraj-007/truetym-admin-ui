'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import OTPInput from '@/components/common/admin-panel/OTPInput';
import PhoneInput from '@/components/common/admin-panel/PhoneInput';
import SignUpCarousel from '@/components/common/admin-panel/SignUpCarousel';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sendOTPError, setSendOTPError] = useState<string | null>(null);
  const [verifyOTPError, setVerifyOTPError] = useState<string | null>(null);

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
