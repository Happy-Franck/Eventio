'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import EventBackground from '@/components/EventBackground';

export default function ChooseRolePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<'client' | 'prestataire' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }
    // Redirect to appropriate register page
    if (selectedRole === 'client') {
      router.push('/register/client');
    } else {
      router.push('/register/prestataire');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EventBackground />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Logo/Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Bienvenue sur EventHub!</h1>
            <p className="text-white/60 text-lg">Choisissez votre rôle pour commencer</p>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Role Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Client Card */}
              <button
                onClick={() => setSelectedRole('client')}
                className={`relative group p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedRole === 'client'
                    ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                {/* Selection Indicator */}
                {selectedRole === 'client' && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">Je suis un Client</h3>
                <p className="text-white/70 mb-4">
                  Je recherche des prestataires pour organiser mes événements
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Rechercher des prestataires</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Créer et gérer mes événements</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Réserver des prestations</span>
                  </li>
                </ul>
              </button>

              {/* Prestataire Card */}
              <button
                onClick={() => setSelectedRole('prestataire')}
                className={`relative group p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedRole === 'prestataire'
                    ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                {/* Selection Indicator */}
                {selectedRole === 'prestataire' && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">Je suis un Prestataire</h3>
                <p className="text-white/70 mb-4">
                  Je propose mes services pour des événements
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Créer mon profil professionnel</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gérer mes prestations</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/60 text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Recevoir des demandes de clients</span>
                  </li>
                </ul>
              </button>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continuer
            </button>

            {/* Back Link */}
            <p className="mt-6 text-center text-white/60 text-sm">
              Vous avez déjà un compte?{' '}
              <Link href="/login" className="text-purple-300 hover:text-purple-200 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-white/40 text-sm">
            © 2024 EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
