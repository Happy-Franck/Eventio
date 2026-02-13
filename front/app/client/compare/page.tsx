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
        alert('You can compare up to 5 providers');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async (ids: number[] = selectedIds) => {
    if (ids.length < 2) {
      alert('Select at least 2 providers to compare');
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
        <h1 className="text-3xl font-bold text-white">Compare Providers</h1>
        <p className="text-white/60 mt-2">Select 2-5 providers to compare their services and pricing</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Select Providers ({selectedIds.length}/5)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {providers.slice(0, 12).map((provider) => (
            <button
              key={provider.id}
              onClick={() => toggleProvider(provider.id)}
              className={`p-4 rounded-xl border-2 transition text-left ${
                selectedIds.includes(provider.id)
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{provider.name}</h3>
                  <p className="text-sm text-white/60 truncate">{provider.email}</p>
                </div>
                {selectedIds.includes(provider.id) && (
                  <svg className="w-6 h-6 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => handleCompare()}
          disabled={selectedIds.length < 2 || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Comparing...' : `Compare ${selectedIds.length} Providers`}
        </button>
      </div>

      {comparisonData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Provider</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Services</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Avg Price Range</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonData.map((data) => (
                  <tr key={data.provider.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {data.provider.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{data.provider.name}</div>
                          <div className="text-sm text-white/60">{data.provider.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{data.services_count} services</div>
                      <div className="text-sm text-white/60">
                        {data.services.slice(0, 2).map(s => s.prestation_type?.name).join(', ')}
                        {data.services.length > 2 && ` +${data.services.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        ${data.avg_price_min} - ${data.avg_price_max}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{data.total_experience} years</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{data.provider.city || '-'}</div>
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
