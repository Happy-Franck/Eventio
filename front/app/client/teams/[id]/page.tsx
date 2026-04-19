'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Team, User, PrestationType } from '@/lib/types';

interface TeamSelection {
  id: number;
  team_id: number;
  provider_id: number;
  prestation_type_id: number;
  estimated_price: number | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  notes: string | null;
  provider: User;
  prestation_type: PrestationType;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [selections, setSelections] = useState<TeamSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [providers, setProviders] = useState<User[]>([]);
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([]);
  const [addForm, setAddForm] = useState({
    provider_id: '',
    prestation_type_id: '',
    estimated_price: '',
    notes: '',
  });

  const inputClass =
    'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmé' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusé' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Annulé' },
  };

  useEffect(() => {
    fetchTeamDetails();
    fetchProviders();
    fetchPrestationTypes();
  }, [params.id]);

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(`/client/teams/${params.id}`);
      setTeam(response.data.data);
      setSelections(response.data.data.selections || []);
    } catch (error) {
      console.error('Error fetching team:', error);
      alert('Error loading team details');
      router.push('/client/teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/client/providers');
      setProviders(response.data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
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

  const handleAddSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        provider_id: parseInt(addForm.provider_id),
        prestation_type_id: parseInt(addForm.prestation_type_id),
        estimated_price: addForm.estimated_price ? parseFloat(addForm.estimated_price) : null,
        notes: addForm.notes || null,
      };

      await axios.post(`/client/teams/${params.id}/selections`, data);
      setShowAddModal(false);
      setAddForm({ provider_id: '', prestation_type_id: '', estimated_price: '', notes: '' });
      fetchTeamDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding provider');
    }
  };

  const handleRemoveSelection = async (selectionId: number) => {
    if (!confirm('Retirer ce prestataire de la team?')) return;
    try {
      await axios.delete(`/client/teams/${params.id}/selections/${selectionId}`);
      fetchTeamDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error removing provider');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const teamStatusCfg = statusConfig[team.status] || statusConfig.cancelled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/client/teams')}
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{team.event_name}</h1>
          <p className="text-gray-500 mt-1">Gérez les sélections de votre team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un Prestataire
        </button>
      </div>

      {/* Team Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {team.event_date && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Date de l'événement</p>
              <p className="text-base font-bold text-gray-900">
                {new Date(team.event_date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
          {team.event_location && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Lieu</p>
              <p className="text-base font-bold text-gray-900">{team.event_location}</p>
            </div>
          )}
          {team.expected_guests && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Invités prévus</p>
              <p className="text-base font-bold text-gray-900">{team.expected_guests}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Statut</p>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${teamStatusCfg.bg} ${teamStatusCfg.text}`}>
              {teamStatusCfg.label}
            </span>
          </div>
        </div>
        {team.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700 leading-relaxed">{team.notes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Prestataires</p>
              <p className="text-2xl font-bold text-gray-900">{selections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmés</p>
              <p className="text-2xl font-bold text-gray-900">
                {selections.filter(s => s.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {selections.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Budget estimé</p>
              <p className="text-2xl font-bold text-gray-900">
                {selections.reduce((sum, s) => sum + (s.estimated_price || 0), 0).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selections List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Sélections de Prestataires</h2>
        </div>

        {selections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">Aucun prestataire ajouté</p>
            <p className="text-gray-400 text-sm mb-6">Ajoutez des prestataires à votre team</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              Ajouter votre Premier Prestataire
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {selections.map((selection) => {
              const selCfg = statusConfig[selection.status] || statusConfig.cancelled;
              return (
                <div key={selection.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                      {selection.provider.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{selection.provider.name}</h3>
                          <p className="text-sm text-gray-500">{selection.provider.email}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${selCfg.bg} ${selCfg.text}`}>
                          {selCfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-gray-600 font-medium">{selection.prestation_type.name}</span>
                        </div>
                        {selection.estimated_price && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-gray-900">{selection.estimated_price.toLocaleString('fr-FR')}€</span>
                          </div>
                        )}
                      </div>

                      {selection.notes && (
                        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{selection.notes}</p>
                      )}

                      <button
                        onClick={() => handleRemoveSelection(selection.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Retirer de la team
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Ajouter un Prestataire</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSelection} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prestataire <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.provider_id}
                  onChange={(e) => setAddForm({ ...addForm, provider_id: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Sélectionner un prestataire</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de service <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.prestation_type_id}
                  onChange={(e) => setAddForm({ ...addForm, prestation_type_id: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Sélectionner un type de service</option>
                  {prestationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix estimé</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.estimated_price}
                    onChange={(e) => setAddForm({ ...addForm, estimated_price: e.target.value })}
                    className={inputClass}
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder="Exigences particulières ou notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
