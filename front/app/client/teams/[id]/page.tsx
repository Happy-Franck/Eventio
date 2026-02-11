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
    if (!confirm('Remove this provider from the team?')) return;
    try {
      await axios.delete(`/client/teams/${params.id}/selections/${selectionId}`);
      fetchTeamDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error removing provider');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/client/teams')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.event_name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your team selections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </button>
      </div>

      {/* Team Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {team.event_date && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Event Date</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date(team.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
          {team.event_location && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{team.event_location}</p>
            </div>
          )}
          {team.expected_guests && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected Guests</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{team.expected_guests}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(team.status)}`}>
              {team.status}
            </span>
          </div>
        </div>
        {team.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-gray-900 dark:text-white">{team.notes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{selections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selections.filter(s => s.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selections.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Est. Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${selections.reduce((sum, s) => sum + (s.estimated_price || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selections List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Provider Selections</h2>
        </div>

        {selections.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No providers added yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow-lg"
            >
              Add Your First Provider
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {selections.map((selection) => (
              <div key={selection.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {selection.provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selection.provider.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selection.provider.email}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selection.status)}`}>
                        {selection.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">{selection.prestation_type.name}</span>
                      </div>
                      {selection.estimated_price && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-gray-900 dark:text-white">${selection.estimated_price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {selection.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selection.notes}</p>
                    )}

                    <button
                      onClick={() => handleRemoveSelection(selection.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                    >
                      Remove from team
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Provider</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSelection} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Provider *
                </label>
                <select
                  value={addForm.provider_id}
                  onChange={(e) => setAddForm({ ...addForm, provider_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Service Type *
                </label>
                <select
                  value={addForm.prestation_type_id}
                  onChange={(e) => setAddForm({ ...addForm, prestation_type_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select a service type</option>
                  {prestationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={addForm.estimated_price}
                  onChange={(e) => setAddForm({ ...addForm, estimated_price: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow-lg"
                >
                  Add Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
