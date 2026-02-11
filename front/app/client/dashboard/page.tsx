'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

interface Stats {
  teams_count: number;
  budgets_count: number;
  collections_count: number;
  total_selections: number;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [teamsRes, budgetsRes, collectionsRes] = await Promise.all([
        axios.get('/client/teams'),
        axios.get('/client/budgets'),
        axios.get('/client/collections'),
      ]);

      const totalSelections = teamsRes.data.data.reduce(
        (sum: number, team: any) => sum + (team.selections_count || 0),
        0
      );

      setStats({
        teams_count: teamsRes.data.data.length,
        budgets_count: budgetsRes.data.data.length,
        collections_count: collectionsRes.data.data.length,
        total_selections: totalSelections,
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
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Teams"
          value={stats?.teams_count || 0}
          change="+15%"
          changeType="positive"
          gradient="from-blue-500 to-cyan-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/client/teams'}
        />

        <StatCard
          title="Budgets"
          value={stats?.budgets_count || 0}
          change="+8%"
          changeType="positive"
          gradient="from-green-500 to-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/client/budgets'}
        />

        <StatCard
          title="Collections"
          value={stats?.collections_count || 0}
          change="+23%"
          changeType="positive"
          gradient="from-pink-500 to-rose-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          onViewDetail={() => window.location.href = '/client/collections'}
        />

        <StatCard
          title="Total Selections"
          value={stats?.total_selections || 0}
          gradient="from-purple-500 to-indigo-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/client/providers"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Find Providers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Search for event services</p>
            </div>
          </Link>

          <Link
            href="/client/teams"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Create Team</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start planning your event</p>
            </div>
          </Link>

          <Link
            href="/client/budgets"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Create Budget</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan your event budget</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {stats && stats.teams_count === 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get Started with EventIO</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Start planning your perfect event in just a few steps:
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Search for Providers</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse and filter providers by service type and location</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Create Your Team</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add providers to your event team and manage selections</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Set Your Budget</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a budget and track your spending</p>
              </div>
            </div>
          </div>
          <Link
            href="/client/providers"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
          >
            Start Exploring
          </Link>
        </div>
      )}
    </div>
  );
}
