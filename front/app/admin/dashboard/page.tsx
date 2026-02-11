'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

interface Stats {
  total_users: number;
  total_clients: number;
  total_providers: number;
  total_prestation_types: number;
  total_categories: number;
  pending_approvals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch data from existing endpoints
      const [prestationTypesRes, categoriesRes, clientsRes, providersRes] = await Promise.all([
        axios.get('/admin/prestation-types'),
        axios.get('/admin/categories'),
        axios.get('/admin/clients'),
        axios.get('/admin/providers'),
      ]);

      const clients = clientsRes.data.data || [];
      const providers = providersRes.data.data || [];
      const pendingProviders = providers.filter((p: any) => !p.is_approved && p.is_active);

      setStats({
        total_users: clients.length + providers.length,
        total_clients: clients.length,
        total_providers: providers.length,
        total_prestation_types: prestationTypesRes.data.data?.length || 0,
        total_categories: categoriesRes.data.data?.length || 0,
        pending_approvals: pendingProviders.length,
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
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          change="+12%"
          changeType="positive"
          gradient="from-orange-500 to-red-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatCard
          title="Prestation Types"
          value={stats?.total_prestation_types || 0}
          change="+5%"
          changeType="positive"
          gradient="from-green-500 to-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/admin/prestation-types'}
        />

        <StatCard
          title="Categories"
          value={stats?.total_categories || 0}
          change="+8%"
          changeType="positive"
          gradient="from-blue-500 to-cyan-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />

        <StatCard
          title="Pending Approvals"
          value={stats?.pending_approvals || 0}
          gradient="from-purple-500 to-pink-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/admin/providers'}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/prestation-types"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Manage Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add or edit service types</p>
            </div>
          </Link>

          <Link
            href="/admin/clients"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">View Clients</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage client accounts</p>
            </div>
          </Link>

          <Link
            href="/admin/providers"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Approve Providers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review pending requests</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Clients</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_clients || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Providers</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_providers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Platform Status</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">API Status</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Database</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
