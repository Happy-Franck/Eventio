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
  }, []);

  useEffect(() => {
    // Auto-search when filters change (except on initial load)
    const timeoutId = setTimeout(() => {
      fetchProviders();
    }, 300); // Debounce de 300ms

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

      const response = await axios.get(`/client/providers?${params}`);
      setProviders(response.data.data);
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
      // Récupérer ou créer la team
      const teamsResponse = await axios.get('/client/teams');
      let team = teamsResponse.data.data.find((t: any) => t.event_name === 'My Team');
      
      if (!team) {
        const createResponse = await axios.post('/client/teams', {
          event_name: 'My Team',
          status: 'draft'
        });
        team = createResponse.data.data;
      }

      // Ajouter le prestataire
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
        <h1 className="text-3xl font-bold text-white">Find Providers</h1>
        <p className="text-white/60 mt-2">Search and discover event service providers</p>
      </div>

      {/* Search Filters */}
      <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />

          <select
            value={filters.prestation_type_id}
            onChange={(e) => setFilters({ ...filters, prestation_type_id: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
          >
            <option value="">All Services</option>
            {prestationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="City..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />

          <input
            type="number"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />

          <button
            type="button"
            onClick={() => setFilters({ search: '', prestation_type_id: '', city: '', min_price: '', max_price: '' })}
            className="px-6 py-2 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition"
          >
            Clear Filters
          </button>
        </div>
        
        {/* Active Filters Indicator */}
        {(filters.search || filters.prestation_type_id || filters.city || filters.min_price) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters active - Results update automatically</span>
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Searching providers...</p>
          </div>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-white/60">No providers found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{provider.name}</h3>
                  <p className="text-sm text-white/60">{provider.email}</p>
                  {provider.city && (
                    <p className="text-sm text-white/60 mt-1">📍 {provider.city}</p>
                  )}
                </div>
              </div>

              {provider.bio && (
                <p className="text-sm text-white/80 mb-4 line-clamp-2">{provider.bio}</p>
              )}

              {provider.prestation_types && provider.prestation_types.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.prestation_types.map((type) => (
                    <span
                      key={type.id}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full"
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => router.push(`/client/providers/${provider.id}`)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition group-hover:border-purple-500"
              >
                View Details
              </button>

              <button
                onClick={() => handleAddToTeam(provider.id)}
                disabled={addingToTeam === provider.id}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToTeam === provider.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Add to Team
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
