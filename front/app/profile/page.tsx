'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile, updatePassword } from '@/lib/auth';
import EventBackground from '@/components/EventBackground';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      <div className="min-h-screen relative overflow-hidden">
        <EventBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EventBackground />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">EventHub</h1>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-8 border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-white/60">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-white bg-white/10 border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-white bg-white/10 border-b-2 border-pink-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Messages */}
            {message && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200 text-sm backdrop-blur-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Profile Form */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'name' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} style={{ top: '2rem' }} />
                </div>

                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'bg-purple-500/10 ring-2 ring-purple-500/30' : ''}`} style={{ top: '2rem' }} />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Update Profile
                </button>
              </form>
            )}

            {/* Password Form */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="relative">
                  <label htmlFor="current_password" className="block text-sm font-medium text-white/80 mb-2">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    onFocus={() => setFocusedField('current_password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'current_password' ? 'bg-pink-500/10 ring-2 ring-pink-500/30' : ''}`} style={{ top: '2rem' }} />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    required
                    minLength={8}
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'bg-pink-500/10 ring-2 ring-pink-500/30' : ''}`} style={{ top: '2rem' }} />
                </div>

                <div className="relative">
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-white/80 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    onFocus={() => setFocusedField('password_confirmation')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    required
                    minLength={8}
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${focusedField === 'password_confirmation' ? 'bg-pink-500/10 ring-2 ring-pink-500/30' : ''}`} style={{ top: '2rem' }} />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 focus:ring-4 focus:ring-pink-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
