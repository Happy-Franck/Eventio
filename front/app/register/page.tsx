'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get role from URL params
  const role = searchParams.get('role') || 'client';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: passwordConfirmation,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to OTP verification page with registration data
        const params = new URLSearchParams({
          email: email,
          name: name,
          password: password,
          role: role,
        });
        router.push(`/verify-otp?${params.toString()}`);
      } else {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          setError(errorMessages as string);
        } else {
          setError(data.message || t('auth.register.error'));
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || t('auth.register.error'));
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'facebook') => {
    window.location.href = authAPI.getOAuthUrl(provider);
  };

  const getRoleGradient = () => {
    return role === 'prestataire' ? 'from-[#c9a96e] to-[#1a3a5c]' : 'from-[#1a3a5c] to-[#4a6fa5]';
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* EventIO Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Decorative panel - right side for register */}
        <div className="absolute top-0 right-0 bottom-0 w-2/5 bg-navy opacity-95" 
             style={{clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'}} />
        
        {/* Decorative circles */}
        <div className="absolute top-32 right-16 w-64 h-64 border border-white/10 rounded-full" />
        <div className="absolute bottom-40 right-24 w-40 h-40 border border-white/8 rounded-full" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-blue/30 rounded-full animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-dusty/40 rounded-full animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/5 w-8 h-8 bg-light/20 rounded-full animate-float" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${getRoleGradient()} mb-6 shadow-xl`}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-serif text-4xl font-light text-navy mb-2 tracking-wide">
              <span className="font-cursive text-blue mr-1">E</span>ventIO
            </div>
            <p className="text-dusty font-light tracking-wide">{t('auth.register.subtitle')}</p>
          </div>

          {/* Card */}
          <div className="card-eventio">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-light text-navy mb-2">{t('auth.register.title')}</h2>
              <p className="text-dusty font-light tracking-wide">
                {role === 'prestataire' ? 'Inscription en tant que Prestataire' : 'Inscription en tant que Client'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-eventio input-eventio-light"
                  placeholder={t('auth.register.name')}
                />
              </div>

              <div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-eventio input-eventio-light"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>

              <div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-eventio input-eventio-light"
                  placeholder={t('auth.register.password')}
                />
              </div>

              <div>
                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  className="input-eventio input-eventio-light"
                  placeholder={t('auth.register.confirmPassword')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-eventio w-full ${role === 'prestataire' ? 'bg-gradient-to-r from-[#c9a96e] to-[#1a3a5c] hover:from-[#d4b578] hover:to-[#2d5a8e]' : 'btn-eventio-primary'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('loading')}
                  </span>
                ) : (
                  t('auth.register.submit')
                )}
              </button>

              <p className="text-xs text-dusty text-center font-light">
                {t('auth.register.terms')}
              </p>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pale" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-dusty">{t('auth.login.orContinueWith')}</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="btn-eventio btn-eventio-secondary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                onClick={() => handleOAuth('facebook')}
                className="btn-eventio btn-eventio-secondary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-dusty">
              {t('auth.register.haveAccount')}{' '}
              <Link href="/login" className="text-blue hover:text-navy font-semibold transition-colors">
                {t('auth.register.signIn')}
              </Link>
            </p>
            
            {/* Change Role Link */}
            <p className="mt-4 text-center text-dusty text-sm">
              <Link href="/choose-role" className="text-blue hover:text-navy transition-colors">
                ← Changer de rôle
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-dusty/60 text-sm font-light tracking-wide">
            © 2024 EventIO. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
