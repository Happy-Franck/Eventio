'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import EventBackground from '@/components/EventBackground';

interface PrestationType {
  id: number;
  name: string;
  description: string;
}

export default function RegisterPrestatairePage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    business_type: 'individual' as 'individual' | 'company',
    company_name: '',
    password: '',
    password_confirmation: '',
  });
  
  const [selectedPrestationTypes, setSelectedPrestationTypes] = useState<number[]>([]);
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPrestationTypes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/prestation-types', {
          headers: { 'Accept': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setPrestationTypes(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Error fetching prestation types:', err);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchPrestationTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePrestationType = (id: number) => {
    setSelectedPrestationTypes(prev => 
      prev.includes(id) ? prev.filter(typeId => typeId !== id) : [...prev, id]
    );
  };

  const removeType = (id: number) => {
    setSelectedPrestationTypes(prev => prev.filter(typeId => typeId !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedPrestationTypes.length === 0) {
      setError('Veuillez sélectionner au moins un type de prestation');
      return;
    }

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
          ...formData,
          name: `${formData.first_name} ${formData.last_name}`.trim() || formData.username,
          role: 'prestataire',
          prestation_type_ids: selectedPrestationTypes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const params = new URLSearchParams({
          email: formData.email,
          name: `${formData.first_name} ${formData.last_name}`.trim() || formData.username,
          password: formData.password,
          role: 'prestataire',
        });
        router.push(`/verify-otp?${params.toString()}`);
      } else {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EventBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Inscription Prestataire</h1>
            <p className="text-white/60">Créez votre profil professionnel</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Type d'activité *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, business_type: 'individual' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.business_type === 'individual'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-white font-medium">Entrepreneur individuel</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, business_type: 'company' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.business_type === 'company'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-white font-medium">Société</div>
                  </button>
                </div>
              </div>

              {/* Company Name */}
              <div className="relative">
                <input
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('company_name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Nom de l'entreprise *"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'company_name' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              {/* Username */}
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Nom d'utilisateur (affiché sur la plateforme)"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'username' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('first_name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="Prénom"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'first_name' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
                </div>

                <div className="relative">
                  <input
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('last_name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="Nom"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'last_name' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Email *"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Téléphone *"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'phone' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="Ville"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'city' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
                </div>

                <div className="relative">
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="Adresse"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'address' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
                </div>
              </div>

              {/* Prestation Types Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Types de prestations *</label>
                
                {selectedPrestationTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                    {prestationTypes
                      .filter(type => selectedPrestationTypes.includes(type.id))
                      .map(type => (
                        <span
                          key={type.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 rounded-lg text-sm text-white font-medium shadow-lg"
                        >
                          <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {type.name}
                          <button
                            type="button"
                            onClick={() => removeType(type.id)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors ml-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))
                    }
                  </div>
                )}
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 flex items-center justify-between"
                  >
                    <span className={selectedPrestationTypes.length === 0 ? 'text-white/40' : 'text-white'}>
                      {selectedPrestationTypes.length === 0 
                        ? 'Sélectionnez vos types de prestations' 
                        : `${selectedPrestationTypes.length} type${selectedPrestationTypes.length > 1 ? 's' : ''} sélectionné${selectedPrestationTypes.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <svg 
                      className={`w-5 h-5 text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                      {loadingTypes ? (
                        <div className="p-8 text-center">
                          <svg className="animate-spin h-6 w-6 text-white/60 mx-auto" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      ) : prestationTypes.length === 0 ? (
                        <div className="p-4 text-center text-white/60 text-sm">
                          Aucun type de prestation disponible
                        </div>
                      ) : (
                        prestationTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => togglePrestationType(type.id)}
                            className="w-full px-5 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-start gap-3 border-b border-white/5 last:border-b-0"
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedPrestationTypes.includes(type.id)
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-white/30 bg-white/5'
                            }`}>
                              {selectedPrestationTypes.includes(type.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white">{type.name}</div>
                              {type.description && (
                                <div className="text-xs text-white/60 mt-0.5 line-clamp-1">{type.description}</div>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={8}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Mot de passe *"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              {/* Password Confirmation */}
              <div className="relative">
                <input
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password_confirmation')}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={8}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Confirmer le mot de passe *"
                />
                <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password_confirmation' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} />
              </div>

              <button
                type="submit"
                disabled={loading || selectedPrestationTypes.length === 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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

              <p className="text-xs text-white/40 text-center">
                En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité
              </p>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/40">{t('auth.login.orContinueWith')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">Google</span>
              </button>

              <button
                onClick={() => handleOAuth('facebook')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">Facebook</span>
              </button>
            </div>

            <div className="mt-8 space-y-3 text-center text-sm">
              <p className="text-white/60">
                {t('auth.register.haveAccount')}{' '}
                <Link href="/login" className="text-purple-300 hover:text-purple-200 font-medium transition-colors">
                  {t('auth.register.signIn')}
                </Link>
              </p>
              <p className="text-white/60">
                <Link href="/choose-role" className="text-purple-300 hover:text-purple-200 transition-colors">
                  ← Changer de rôle
                </Link>
              </p>
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
