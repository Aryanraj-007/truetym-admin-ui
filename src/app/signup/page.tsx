

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SignUpCarousel from '@/components/common/admin-panel/SignUpCarousel';
import PhoneInput from '@/components/common/admin-panel/PhoneInput';
import OTPInput from '@/components/common/admin-panel/OTPInput';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSendOTP = () => {
    if (phoneNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = (otp: string) => {
    if (otp === '123456') {
      router.push('/dashboard');
    } else {
      alert('Invalid OTP. Please enter 123456');
    }
  };

  const handleGoBack = () => {
    setStep('phone');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Carousel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 to-teal-700">
        <SignUpCarousel />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-12">
            {/* Logo Image - Large Size */}
            <div className="flex justify-center mb-6">
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
            />
          ) : (
            <OTPInput
              phoneNumber={`${countryCode} ${phoneNumber}`}
              onVerify={handleVerifyOTP}
              onGoBack={handleGoBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
