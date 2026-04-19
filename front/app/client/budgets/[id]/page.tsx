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

  const inputClass =
    'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Actif' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Brouillon' },
  };

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
    if (!confirm('Supprimer cet article du budget?')) return;
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
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center text-gray-500 py-12 font-medium">Budget introuvable</div>
    );
  }

  const cfg = statusConfig[budget.status] || statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Détails du Budget</h1>
          <p className="text-gray-500 mt-1">Gérez les articles et le suivi de votre budget</p>
        </div>
      </div>

      {/* Budget Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{budget.event_name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">{budget.total_budget_min}€ – {budget.total_budget_max}€</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        {budget.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Alloué</p>
              <p className="text-gray-900 font-bold text-sm">{budget.summary.total_allocated_min}€ – {budget.summary.total_allocated_max}€</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Restant</p>
              <p className="text-gray-900 font-bold text-sm">{budget.summary.remaining_min}€ – {budget.summary.remaining_max}€</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Variance</p>
              <p className={`font-bold text-sm ${budget.summary.variance_min < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {budget.summary.variance_min}€ – {budget.summary.variance_max}€
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Articles</p>
              <p className="text-gray-900 font-bold text-sm">{budget.items?.length || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Articles du Budget</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 font-semibold rounded-xl transition-all shadow-sm ${
            showForm
              ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-md'
          }`}
        >
          {showForm ? 'Annuler' : 'Ajouter un Article'}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-5">Nouvel Article</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de service <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.prestation_type_id}
                onChange={(e) => setFormData({ ...formData, prestation_type_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Sélectionner un service</option>
                {prestationTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant min <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.allocated_min}
                    onChange={(e) => setFormData({ ...formData, allocated_min: e.target.value })}
                    className={inputClass}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant max <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.allocated_max}
                    onChange={(e) => setFormData({ ...formData, allocated_max: e.target.value })}
                    className={inputClass}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={inputClass}
                placeholder="Notes optionnelles..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Ajouter l'Article
            </button>
          </form>
        </div>
      )}

      {/* Items List */}
      {budget.items && budget.items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">Aucun article dans ce budget</p>
          <p className="text-gray-400 text-sm mb-6">Commencez par ajouter des lignes de dépenses</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Ajouter le Premier Article
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budget.items?.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.prestation_type.name}</h3>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Article
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-700 font-medium text-sm">
                      {item.allocated_min}€ – {item.allocated_max}€
                    </p>
                  </div>
                  {item.notes && (
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
