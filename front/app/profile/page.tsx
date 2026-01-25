'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, updatePassword } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

            {message && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Profile Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Back to Dashboard */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
