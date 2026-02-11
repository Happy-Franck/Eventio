'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface Stats {
  services_count: number;
  total_requests: number;
  pending_requests: number;
  confirmed_requests: number;
  rejected_requests: number;
  collections_count: number;
  avg_price_min: number;
  avg_price_max: number;
  total_experience_years: number;
  profile_completion: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
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
        total_requests: data.requests.total_requests || 0,
        pending_requests: data.requests.pending_requests || 0,
        confirmed_requests: data.requests.confirmed_requests || 0,
        rejected_requests: data.requests.rejected_requests || 0,
        collections_count: data.collections.total_in_collections || 0,
        avg_price_min: data.pricing.average_price_min || 0,
        avg_price_max: data.pricing.average_price_max || 0,
        total_experience_years: 0, // Not in API response
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
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-white/60 py-12">
        Failed to load statistics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Statistics</h1>
        <p className="text-white/60 mt-2">Track your business performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Services</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.services_count}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Requests</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total_requests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Confirmed</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.confirmed_requests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">In Collections</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.collections_count}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Request Breakdown */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Request Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <p className="text-4xl font-bold text-yellow-400 mb-2">{stats.pending_requests}</p>
            <p className="text-white/60">Pending</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <p className="text-4xl font-bold text-green-400 mb-2">{stats.confirmed_requests}</p>
            <p className="text-white/60">Confirmed</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <p className="text-4xl font-bold text-red-400 mb-2">{stats.rejected_requests}</p>
            <p className="text-white/60">Rejected</p>
          </div>
        </div>
      </div>

      {/* Pricing & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Average Pricing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Minimum Price</span>
              <span className="text-2xl font-bold text-white">
                ${stats.avg_price_min.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Maximum Price</span>
              <span className="text-2xl font-bold text-white">
                ${stats.avg_price_max.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Profile Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Profile Completion</span>
                <span className="text-2xl font-bold text-white">{stats.profile_completion}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.profile_completion}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-white/60">Total Experience</span>
              <span className="text-2xl font-bold text-white">
                {stats.total_experience_years} years
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
