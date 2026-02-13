'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function CreateBudgetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    event_name: '',
    total_budget_min: '',
    total_budget_max: '',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/client/budgets', formData);
      router.push('/client/budgets');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating budget');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Budgets
      </button>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Create New Budget</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Event Name *</label>
            <input
              type="text"
              required
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="e.g., Wedding Reception"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Minimum Budget *</label>
              <input
                type="number"
                required
                value={formData.total_budget_min}
                onChange={(e) => setFormData({ ...formData, total_budget_min: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Maximum Budget *</label>
              <input
                type="number"
                required
                value={formData.total_budget_max}
                onChange={(e) => setFormData({ ...formData, total_budget_max: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
            >
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
