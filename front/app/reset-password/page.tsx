'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/auth';
import EventBackground from '@/components/EventBackground';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, email, password, passwordConfirmation);
      setSuccess(response.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EventBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">EventHub</h1>
            <p className="text-white/60">Set your new password</p>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
              <p className="text-white/60 mt-2">Enter your new password</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200 text-sm backdrop-blur-sm">
                {success}
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                    placeholder="Email address"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'bg-green-500/10 ring-2 ring-green-500/30' : ''}`} />
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength={8}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                    placeholder="New password"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'bg-green-500/10 ring-2 ring-green-500/30' : ''}`} />
                </div>

                <div className="relative">
                  <input
                    id="password_confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    onFocus={() => setFocusedField('password_confirmation')}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength={8}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                    placeholder="Confirm password"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password_confirmation' ? 'bg-green-500/10 ring-2 ring-green-500/30' : ''}`} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 focus:ring-4 focus:ring-green-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-white/40 text-sm">
            © 2024 EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
