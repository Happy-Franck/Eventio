'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function ChooseRolePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<'client' | 'prestataire' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }
    if (selectedRole === 'client') {
      router.push('/register/client');
    } else {
      router.push('/register/prestataire');
    }
  };

  return (
    <div className="min-h-screen bg-offwhite relative overflow-hidden">
      {/* EventIO Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central decorative panel */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bottom-0 w-1/3 bg-grad-secondary opacity-20" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-48 h-48 border border-blue/20 rounded-full" />
        <div className="absolute bottom-32 right-20 w-64 h-64 border border-dusty/20 rounded-full" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-blue/30 rounded-full animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-dusty/40 rounded-full animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-light/20 rounded-full animate-float" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Logo/Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-grad-primary mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-serif text-5xl font-light text-navy mb-4 tracking-wide">
              Bienvenue sur <span className="font-cursive text-blue">E</span>ventIO!
            </div>
            <p className="text-dusty text-lg font-light tracking-wide">Choisissez votre rôle pour commencer</p>
          </div>

          {/* Card */}
          <div className="card-eventio max-w-5xl mx-auto">
            {/* Role Selection - EventIO Style */}
            <div className="grid md:grid-cols-2 gap-2 mb-8">
              {/* Client Panel - EventIO Style */}
              <button
                onClick={() => setSelectedRole('client')}
                className={`role-panel-eventio client relative group p-8 rounded-2xl transition-all duration-300 text-left ${
                  selectedRole === 'client'
                    ? 'ring-2 ring-blue shadow-lg shadow-blue/20'
                    : ''
                }`}
              >
                {selectedRole === 'client' && (
                  <div className="absolute top-6 right-6 w-8 h-8 bg-blue rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="w-16 h-16 rounded-2xl bg-pale flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <div className="text-xs font-medium text-blue mb-3 tracking-widest uppercase">Pour les clients</div>
                <h3 className="font-serif text-3xl font-light text-navy mb-4 leading-tight">Je cherche des prestataires pour mon événement</h3>
                <p className="text-dusty mb-6 leading-relaxed font-light">
                  Mariages, anniversaires, événements corporate — trouvez les meilleurs talents et gérez votre projet de A à Z.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-navy text-sm">
                    <div className="w-1.5 h-1.5 bg-blue rounded-full flex-shrink-0 mt-2"></div>
                    <span>Recherche filtrée par type, ville, budget</span>
                  </li>
                  <li className="flex items-start gap-3 text-navy text-sm">
                    <div className="w-1.5 h-1.5 bg-blue rounded-full flex-shrink-0 mt-2"></div>
                    <span>Comparaison de prestataires côte à côte</span>
                  </li>
                  <li className="flex items-start gap-3 text-navy text-sm">
                    <div className="w-1.5 h-1.5 bg-blue rounded-full flex-shrink-0 mt-2"></div>
                    <span>Gestion d'équipe & collections</span>
                  </li>
                  <li className="flex items-start gap-3 text-navy text-sm">
                    <div className="w-1.5 h-1.5 bg-blue rounded-full flex-shrink-0 mt-2"></div>
                    <span>Suivi du budget en temps réel</span>
                  </li>
                </ul>
              </button>

              {/* Provider Panel - EventIO Style */}
              <button
                onClick={() => setSelectedRole('prestataire')}
                className={`role-panel-eventio provider relative group p-8 rounded-2xl transition-all duration-300 text-left ${
                  selectedRole === 'prestataire'
                    ? 'ring-2 ring-light shadow-lg shadow-navy/20'
                    : ''
                }`}
              >
                {selectedRole === 'prestataire' && (
                  <div className="absolute top-6 right-6 w-8 h-8 bg-light rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="text-xs font-medium text-light mb-3 tracking-widest uppercase">Pour les prestataires</div>
                <h3 className="font-serif text-3xl font-light text-white mb-4 leading-tight">Je propose mes services pour des événements</h3>
                <p className="text-white/70 mb-6 leading-relaxed font-light">
                  Développez votre activité, gérez vos demandes et construisez une réputation solide sur la première plateforme événementielle française.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-light rounded-full flex-shrink-0 mt-2"></div>
                    <span>Profil professionnel mis en valeur</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-light rounded-full flex-shrink-0 mt-2"></div>
                    <span>Gestion des demandes entrantes</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-light rounded-full flex-shrink-0 mt-2"></div>
                    <span>Statistiques de performance</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-light rounded-full flex-shrink-0 mt-2"></div>
                    <span>Visibilité auprès de milliers de clients</span>
                  </li>
                </ul>
              </button>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className="btn-eventio btn-eventio-primary w-full"
            >
              Continuer →
            </button>

            {/* Back Link */}
            <p className="mt-6 text-center text-dusty text-sm">
              Vous avez déjà un compte?{' '}
              <Link href="/login" className="text-blue hover:text-navy font-semibold transition-colors">
                Se connecter
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
