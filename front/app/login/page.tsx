'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'facebook') => {
    window.location.href = authAPI.getOAuthUrl(provider);
  };

  return (
    <div className="min-h-screen bg-offwhite relative overflow-hidden">
      {/* EventIO Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Navy gradient panel */}
        <div className="absolute top-0 left-0 bottom-0 w-2/5 bg-grad-secondary opacity-90" 
             style={{clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)'}} />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-80 h-80 border border-white/10 rounded-full" />
        <div className="absolute bottom-32 left-16 w-48 h-48 border border-white/8 rounded-full" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-blue/30 rounded-full animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-dusty/40 rounded-full animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 right-1/5 w-8 h-8 bg-light/20 rounded-full animate-float" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-grad-primary mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-serif text-4xl font-light text-navy mb-2 tracking-wide">
              <span className="font-cursive text-blue mr-1">E</span>ventIO
            </div>
            <p className="text-dusty font-light tracking-wide">{t('auth.login.subtitle')}</p>
          </div>

          {/* Card */}
          <div className="card-eventio-glass">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-light text-navy mb-2">{t('auth.login.welcomeBack')}</h2>
              <p className="text-dusty font-light tracking-wide">{t('auth.login.subtitle')}</p>
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
                <label className="block text-sm font-medium text-navy mb-2 tracking-wide">{t('auth.emailPlaceholder')}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-eventio input-eventio-light"
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2 tracking-wide">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-eventio input-eventio-light"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-pale bg-white text-blue focus:ring-blue/20 focus:ring-offset-0" />
                  <span className="ml-2 text-dusty group-hover:text-navy transition-colors">{t('auth.login.rememberMe')}</span>
                </label>
                <Link href="/forgot-password" className="text-blue hover:text-navy font-medium transition-colors tracking-wide">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-eventio btn-eventio-primary w-full"
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
                  t('auth.login.button')
                )}
              </button>
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

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-dusty">
              {t('auth.login.noAccount')}{' '}
              <Link href="/choose-role" className="text-blue hover:text-navy font-semibold transition-colors">
                {t('auth.register.title')}
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