'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User } from '@/lib/auth';
import ModernDashboardLayout from '@/components/ModernDashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

        if (role !== 'admin') {
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
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/admin/prestation-types', label: 'Services', icon: 'briefcase' },
    { href: '/admin/categories', label: 'Categories', icon: 'settings' },
    { href: '/admin/clients', label: 'Clients', icon: 'users' },
    { href: '/admin/providers', label: 'Providers', icon: 'users' },
  ];

  return (
    <ModernDashboardLayout user={user} menuItems={menuItems} role="admin">
      {children}
    </ModernDashboardLayout>
  );
}
