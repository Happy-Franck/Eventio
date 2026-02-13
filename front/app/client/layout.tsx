'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User } from '@/lib/auth';
import ModernDashboardLayout from '@/components/ModernDashboardLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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

        if (role !== 'client') {
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
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { href: '/client/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/client/providers', label: 'Find Providers', icon: 'search' },
    { href: '/client/teams', label: 'My Teams', icon: 'users' },
    { href: '/client/budgets', label: 'Budgets', icon: 'dollar' },
    { href: '/client/collections', label: 'Collections', icon: 'heart' },
    { href: '/client/compare', label: 'Compare', icon: 'chart' },
  ];

  return (
    <ModernDashboardLayout user={user} menuItems={menuItems} role="client">
      {children}
    </ModernDashboardLayout>
  );
}
