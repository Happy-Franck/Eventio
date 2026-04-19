'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import { User, ProviderService } from '@/lib/types';

interface ComparisonData {
  provider: User;
  services: ProviderService[];
  avg_price_min: number;
  avg_price_max: number;
  total_experience: number;
  services_count: number;
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      const parsedIds = ids.split(',').map(Number);
      setSelectedIds(parsedIds);
      if (parsedIds.length >= 2) {
        handleCompare(parsedIds);
      }
    }
  }, [searchParams]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/client/providers');
      setProviders(response.data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const toggleProvider = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 5) {
        alert('Vous pouvez comparer jusqu\'à 5 prestataires');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async (ids: number[] = selectedIds) => {
    if (ids.length < 2) {
      alert('Sélectionnez au moins 2 prestataires pour comparer');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/client/compare/providers', { provider_ids: ids });
      setComparisonData(response.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error comparing providers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Comparer les Prestataires</h1>
        <p className="text-gray-500 mt-1">Sélectionnez 2 à 5 prestataires pour comparer leurs services et tarifs</p>
      </div>

      {/* Provider Selection */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Sélectionner des Prestataires
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            {selectedIds.length}/5
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {providers.slice(0, 12).map((provider) => {
            const isSelected = selectedIds.includes(provider.id);
            return (
              <button
                key={provider.id}
                onClick={() => toggleProvider(provider.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-sm">{provider.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{provider.email}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleCompare()}
          disabled={selectedIds.length < 2 || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Comparaison en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comparer {selectedIds.length} Prestataire{selectedIds.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {/* Comparison Table */}
      {comparisonData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Résultats de la Comparaison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Prestataire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Services</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tarif Moyen</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Expérience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Localisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonData.map((data) => (
                  <tr key={data.provider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                          {data.provider.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{data.provider.name}</div>
                          <div className="text-sm text-gray-500">{data.provider.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{data.services_count} service(s)</div>
                      <div className="text-sm text-gray-500">
                        {data.services.slice(0, 2).map(s => s.prestation_type?.name).join(', ')}
                        {data.services.length > 2 && ` +${data.services.length - 2}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {data.avg_price_min}€ – {data.avg_price_max}€
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 font-medium">{data.total_experience} ans</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{data.provider.city || '—'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
