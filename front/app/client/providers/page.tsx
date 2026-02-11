'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { User, PrestationType, ProviderService } from '@/lib/types';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<User[]>([]);
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([]);
  const [loading, setLoading] = useState(true);
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
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

              <button className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition group-hover:border-purple-500">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
