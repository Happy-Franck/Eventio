'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile, updatePassword } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setProfileData({
        name: data.name,
        email: data.email,
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
      router.push('/login');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const data = await updateProfile(profileData);
      setUser(data.user);
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.password !== passwordData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      await updatePassword(passwordData);
      setMessage('Password updated successfully');
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="loading-eventio">
          <div className="spinner-eventio" />
          <p className="text-dusty font-light tracking-wide mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Navigation - EventIO Style */}
      <nav className="nav-eventio bg-white border-b border-pale sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-serif text-lg font-light text-navy tracking-wide">
                <span className="font-cursive text-blue mr-1">E</span>ventIO
              </div>
            </div>
            <Link
              href="/dashboard"
              className="btn-eventio btn-eventio-ghost flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card-eventio overflow-hidden">
          {/* Header - EventIO Style */}
          <div className="bg-grad-primary p-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-filter backdrop-blur-sm flex items-center justify-center text-white font-serif text-3xl font-light shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="font-serif text-3xl font-light text-white tracking-wide">Paramètres du Profil</h1>
                <p className="text-white/85 mt-1 font-light tracking-wide">Gérez vos informations et préférences</p>
              </div>
            </div>
          </div>

          {/* Tabs - EventIO Style */}
          <div className="flex border-b border-pale">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'text-blue border-b-2 border-blue bg-pale/30'
                  : 'text-dusty hover:text-navy hover:bg-pale/20'
              }`}
            >
              Informations du Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${
                activeTab === 'password'
                  ? 'text-blue border-b-2 border-blue bg-pale/30'
                  : 'text-dusty hover:text-navy hover:bg-pale/20'
              }`}
            >
              Changer le Mot de Passe
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Messages */}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Profile Form */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-navy mb-2 tracking-wide">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-eventio input-eventio-light"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy mb-2 tracking-wide">
                    Adresse Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-eventio input-eventio-light"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-eventio btn-eventio-primary w-full"
                >
                  Mettre à jour le Profil
                </button>
              </form>
            )}

            {/* Password Form */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-navy mb-2 tracking-wide">
                    Mot de passe actuel
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="input-eventio input-eventio-light"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-navy mb-2 tracking-wide">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="input-eventio input-eventio-light"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-navy mb-2 tracking-wide">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    className="input-eventio input-eventio-light"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-eventio btn-eventio-primary w-full"
                >
                  Mettre à jour le Mot de Passe
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}