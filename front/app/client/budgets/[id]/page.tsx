'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';

interface BudgetItem {
  id: number;
  prestation_type: { id: number; name: string };
  allocated_min: number;
  allocated_max: number;
  notes: string | null;
}

interface Budget {
  id: number;
  event_name: string;
  total_budget_min: number;
  total_budget_max: number;
  status: string;
  items: BudgetItem[];
  summary: {
    total_allocated_min: number;
    total_allocated_max: number;
    remaining_min: number;
    remaining_max: number;
    variance_min: number;
    variance_max: number;
  };
}

export default function BudgetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [prestationTypes, setPrestationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    prestation_type_id: '',
    allocated_min: '',
    allocated_max: '',
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchBudget();
      fetchPrestationTypes();
    }
  }, [params.id]);

  const fetchBudget = async () => {
    try {
      const response = await axios.get(`/client/budgets/${params.id}`);
      const summaryResponse = await axios.get(`/client/budgets/${params.id}/summary`);
      setBudget({ ...response.data.data, summary: summaryResponse.data.data });
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrestationTypes = async () => {
    try {
      const response = await axios.get('/prestation-types');
      setPrestationTypes(response.data);
    } catch (error) {
      console.error('Error fetching prestation types:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/client/budgets/${params.id}/items`, formData);
      setShowForm(false);
      setFormData({ prestation_type_id: '', allocated_min: '', allocated_max: '', notes: '' });
      fetchBudget();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Delete this budget item?')) return;
    try {
      await axios.delete(`/client/budgets/${params.id}/items/${itemId}`);
      fetchBudget();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!budget) {
    return <div className="text-center text-white/60">Budget not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Budgets
      </button>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{budget.event_name}</h1>
            <p className="text-white/60 mt-2">Budget: ${budget.total_budget_min} - ${budget.total_budget_max}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            budget.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
            budget.status === 'completed' ? 'bg-green-500/20 text-green-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {budget.status}
          </span>
        </div>

        {budget.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-white/60 text-sm">Allocated</p>
              <p className="text-white font-bold">${budget.summary.total_allocated_min} - ${budget.summary.total_allocated_max}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Remaining</p>
              <p className="text-white font-bold">${budget.summary.remaining_min} - ${budget.summary.remaining_max}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Variance</p>
              <p className={`font-bold ${budget.summary.variance_min < 0 ? 'text-red-400' : 'text-green-400'}`}>
                ${budget.summary.variance_min} - ${budget.summary.variance_max}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Items</p>
              <p className="text-white font-bold">{budget.items?.length || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Budget Items</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition"
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add Budget Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Service Type *</label>
              <select
                required
                value={formData.prestation_type_id}
                onChange={(e) => setFormData({ ...formData, prestation_type_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Select a service</option>
                {prestationTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Min Amount *</label>
                <input
                  type="number"
                  required
                  value={formData.allocated_min}
                  onChange={(e) => setFormData({ ...formData, allocated_min: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Max Amount *</label>
                <input
                  type="number"
                  required
                  value={formData.allocated_max}
                  onChange={(e) => setFormData({ ...formData, allocated_max: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
            >
              Add Item
            </button>
          </form>
        </div>
      )}

      {budget.items && budget.items.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <p className="text-white/60 mb-4">No budget items yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budget.items?.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{item.prestation_type.name}</h3>
                  <p className="text-white/80">Allocated: ${item.allocated_min} - ${item.allocated_max}</p>
                  {item.notes && <p className="text-white/60 text-sm mt-2">{item.notes}</p>}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
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
