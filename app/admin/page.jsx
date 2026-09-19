// app/admin/page.jsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtpAction, verifyOtpAction } from '../actions/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const res = await sendOtpAction(email);
    if (res.success) {
      setStep(2);
      setMessage('OTP sent to your email! Valid for 2 mins.');
    } else {
      setMessage(res.error);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await verifyOtpAction(email, otp);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setMessage(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
        
        {message && <p className="mb-4 text-sm text-center text-red-600">{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 border rounded"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
             <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="p-2 border rounded text-center tracking-widest text-lg"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}