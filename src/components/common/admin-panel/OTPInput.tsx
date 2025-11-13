'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OTPInputProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onGoBack: () => void;
}

export default function OTPInput({ phoneNumber, onVerify, onGoBack }: OTPInputProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && index === 5) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === 6) {
      verifyOTP(pastedData);
    }
  };

  const verifyOTP = (otpValue: string) => {
    if (otpValue === '123456') {
      // Store auth token in localStorage
      localStorage.setItem('authToken', 'user_' + Date.now());
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      alert('Invalid OTP. Please enter 123456');
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(59);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      verifyOTP(otpValue);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify your account</h2>
        <p className="text-gray-600 text-sm">
          We've sent a code to <span className="font-medium">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-14 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
              digit
                ? 'border-teal-600 bg-teal-50'
                : 'border-gray-300 focus:border-teal-500'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Resend code
          </button>
        ) : (
          <p className="text-gray-600 text-sm">
            Resend code in <span className="font-medium">{timer}s</span>
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={otp.some((digit) => !digit)}
        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        Submit
      </button>

      <p className="text-center text-sm text-gray-600">
        Want to login with different number?{' '}
        <button onClick={onGoBack} className="text-teal-600 hover:text-teal-700 font-medium">
          Go back & change it
        </button>
      </p>

      <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-900">OTP sent successfully!</span>
      </div>
    </div>
  );
}

