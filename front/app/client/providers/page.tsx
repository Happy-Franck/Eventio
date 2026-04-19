'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { User, PrestationType, ProviderService } from '@/lib/types';

export default function ProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<User[]>([]);
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToTeam, setAddingToTeam] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    prestation_type_id: '',
    city: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    fetchPrestationTypes();
    fetchProviders();
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchProviders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchPrestationTypes = async () => {
    try {
      const response = await axios.get('/prestation-types');
      setPrestationTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch prestation types:', error);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', currentPage.toString());
      params.append('per_page', '15');

      const response = await axios.get(`/client/providers?${params}`);
      setProviders(response.data.data);
      setTotal(response.data.meta?.total || response.data.data.length);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleAddToTeam = async (providerId: number) => {
    setAddingToTeam(providerId);
    try {
      const teamsResponse = await axios.get('/client/teams');
      let team = teamsResponse.data.data.find((t: any) => t.event_name === 'My Team');

      if (!team) {
        const createResponse = await axios.post('/client/teams', {
          event_name: 'My Team',
          status: 'draft'
        });
        team = createResponse.data.data;
      }

      const provider = providers.find(p => p.id === providerId);
      const prestationType = provider?.prestation_types?.[0];

      await axios.post(`/client/teams/${team.id}/selections`, {
        provider_id: providerId,
        prestation_type_id: prestationType?.id || 1,
      });

      alert('Provider added to your team!');
    } catch (error: any) {
      if (error.response?.status === 422) {
        alert('This provider is already in your team');
      } else {
        alert(error.response?.data?.message || 'Error adding to team');
      }
    } finally {
      setAddingToTeam(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Trouver des Prestataires</h1>
        <p className="text-gray-600 mt-1">Recherchez et découvrez des prestataires de services</p>
      </div>

      {/* Search Filters */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <select
            value={filters.prestation_type_id}
            onChange={(e) => setFilters({ ...filters, prestation_type_id: e.target.value })}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Tous les services</option>
            {prestationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ville..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <input
            type="number"
            placeholder="Prix min"
            value={filters.min_price}
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <button
            type="button"
            onClick={() => setFilters({ search: '', prestation_type_id: '', city: '', min_price: '', max_price: '' })}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Effacer filtres
          </button>
        </div>

        {(filters.search || filters.prestation_type_id || filters.city || filters.min_price) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Filtres actifs — Résultats mis à jour automatiquement</span>
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Recherche en cours...</p>
          </div>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 font-medium">Aucun prestataire trouvé. Essayez d'ajuster vos filtres.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm font-medium">
              {providers.length} sur {total} prestataires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{provider.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{provider.email}</p>
                    {provider.city && (
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">{provider.city}</p>
                      </div>
                    )}
                  </div>
                </div>

                {provider.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{provider.bio}</p>
                )}

                {provider.prestation_types && provider.prestation_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.prestation_types.map((type) => (
                      <span
                        key={type.id}
                        className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/client/providers/${provider.id}`)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                  >
                    Voir le profil
                  </button>

                  <button
                    onClick={() => handleAddToTeam(provider.id)}
                    disabled={addingToTeam === provider.id}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {addingToTeam === provider.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="text-sm text-gray-600 font-medium">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
