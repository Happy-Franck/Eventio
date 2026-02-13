'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

interface Budget {
  id: number;
  event_name: string;
  total_budget_min: number;
  total_budget_max: number;
  status: string;
  items_count: number;
  total_allocated: number;
  created_at: string;
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/client/budgets');
      setBudgets(response.data.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await axios.delete(`/client/budgets/${id}`);
      fetchBudgets();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Budgets</h1>
          <p className="text-white/60 mt-2">Plan and track your event budgets</p>
        </div>
        <button
          onClick={() => router.push('/client/budgets/create')}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
        >
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Total Budgets</p>
              <p className="text-2xl font-bold text-white">{budgets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Active</p>
              <p className="text-2xl font-bold text-white">{budgets.filter(b => b.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Total Items</p>
              <p className="text-2xl font-bold text-white">{budgets.reduce((sum, b) => sum + (b.items_count || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white/60 mb-4">No budgets created yet</p>
          <button
            onClick={() => router.push('/client/budgets/create')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{budget.event_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  budget.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                  budget.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {budget.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-white/80 text-sm">Budget Range: ${budget.total_budget_min} - ${budget.total_budget_max}</p>
                <p className="text-white/80 text-sm">Items: {budget.items_count || 0}</p>
                {budget.total_allocated > 0 && (
                  <p className="text-white/80 text-sm">Allocated: ${budget.total_allocated}</p>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => router.push(`/client/budgets/${budget.id}`)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
