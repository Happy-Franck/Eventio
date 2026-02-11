'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/auth';
import EventBackground from '@/components/EventBackground';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToDashboard = async () => {
      if (!authAPI.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const user = await authAPI.getUser();
        const role = authAPI.getUserRole(user);

        // Redirect to role-specific dashboard
        switch (role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'prestataire':
            router.push('/provider/dashboard');
            break;
          case 'client':
            router.push('/client/dashboard');
            break;
          default:
            router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    redirectToDashboard();
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EventBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/60">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
