'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User } from '@/lib/auth';
import ModernDashboardLayout from '@/components/ModernDashboardLayout';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await authAPI.getUser();
        const role = authAPI.getUserRole(userData);

        if (role !== 'prestataire') {
          router.push('/dashboard');
          return;
        }

        setUser(userData);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/provider/profile', label: 'Profile', icon: 'user' },
    { href: '/provider/services', label: 'My Services', icon: 'briefcase' },
    { href: '/provider/requests', label: 'Requests', icon: 'inbox' },
    { href: '/provider/stats', label: 'Statistics', icon: 'chart' },
  ];

  return (
    <ModernDashboardLayout user={user} menuItems={menuItems} role="provider">
      {children}
    </ModernDashboardLayout>
  );
}
