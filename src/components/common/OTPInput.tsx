'use client';

import { useEffect, useRef, useState } from 'react';

interface OTPInputProps {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<boolean> | boolean | void;
  onGoBack: () => void;
  error?: string | null;
}

export default function OTPInput({ phoneNumber, onVerify, onGoBack, error }: OTPInputProps) {
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
  };

  const verifyOTP = (otpValue: string) => {
    // Delegate verification to parent via onVerify prop
    Promise.resolve(onVerify(otpValue))
      .then((result) => {
        // If parent returns explicit false, treat as failure
        if (result === false) {
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
        // If parent handled navigation, do nothing here
      })
      .catch(() => {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      });
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
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Verify your account</h2>
        <p className="text-sm text-gray-600">
          We have sent a code to <span className="font-medium">{phoneNumber}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
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
            className={`h-14 w-14 rounded-lg border-2 text-center text-2xl font-semibold transition-colors focus:outline-none ${
              digit ? 'border-teal-600 bg-teal-50' : 'border-gray-300 focus:border-teal-500'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Resend code
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-medium">{timer}s</span>
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={otp.some((digit) => !digit)}
        className="w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Submit
      </button>

      <p className="text-center text-sm text-gray-600">
        Want to login with different number?{' '}
        <button onClick={onGoBack} className="font-medium text-teal-600 hover:text-teal-700">
          Go back & change it
        </button>
      </p>

      <div className="fixed right-6 bottom-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-900">OTP sent successfully!</span>
      </div>
    </div>
  );
}
