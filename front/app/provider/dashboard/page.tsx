'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

interface QuickStats {
  services_count: number;
  pending_requests: number;
  confirmed_requests: number;
  profile_completion: number;
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/provider/stats');
      const data = response.data.data;

      setStats({
        services_count: data.services.total_services || 0,
        pending_requests: data.requests.pending_requests || 0,
        confirmed_requests: data.requests.confirmed_requests || 0,
        profile_completion: data.profile_completion.percentage || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mes Services"
          value={stats?.services_count || 0}
          change="+10%"
          changeType="positive"
          gradient="from-purple-500 to-pink-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/provider/services'}
        />

        <StatCard
          title="Demandes en attente"
          value={stats?.pending_requests || 0}
          gradient="from-yellow-500 to-orange-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/provider/requests'}
        />

        <StatCard
          title="Confirmées"
          value={stats?.confirmed_requests || 0}
          change="+18%"
          changeType="positive"
          gradient="from-green-500 to-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Profil Complété"
          value={`${stats?.profile_completion || 0}%`}
          gradient="from-purple-500 to-indigo-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/provider/profile'}
        />
      </div>

      {/* Profile Completion Alert */}
      {stats && stats.profile_completion < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">Complétez Votre Profil</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Votre profil est complété à {stats.profile_completion}%. Un profil complet aide les clients à trouver et faire confiance à vos services.
              </p>
              <Link
                href="/provider/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Compléter le Profil
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/provider/services"
            className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ajouter un Service</p>
              <p className="text-sm text-gray-600">Créer une nouvelle offre</p>
            </div>
          </Link>

          <Link
            href="/provider/requests"
            className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Voir les Demandes</p>
              <p className="text-sm text-gray-600">Gérer les demandes clients</p>
            </div>
          </Link>

          <Link
            href="/provider/stats"
            className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Voir les Stats</p>
              <p className="text-sm text-gray-600">Vérifier vos performances</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {stats && stats.services_count === 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Démarrez en tant que Prestataire</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Commencez à développer votre activité sur EventIO :
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Complétez Votre Profil</p>
                <p className="text-sm text-gray-600 mt-0.5">Ajoutez vos coordonnées, bio et portfolio</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ajoutez Vos Services</p>
                <p className="text-sm text-gray-600 mt-0.5">Listez les services que vous proposez avec tarifs et détails</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Répondez aux Demandes</p>
                <p className="text-sm text-gray-600 mt-0.5">Acceptez ou refusez les demandes clients</p>
              </div>
            </div>
          </div>
          <Link
            href="/provider/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Ajouter votre premier service
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
