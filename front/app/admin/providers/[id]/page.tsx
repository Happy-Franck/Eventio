'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';
import { User, ProviderService } from '@/lib/types';

export default function ProviderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [provider, setProvider] = useState<User | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProvider();
      fetchServices();
    }
  }, [params.id]);

  const fetchProvider = async () => {
    try {
      const response = await axios.get(`/admin/providers/${params.id}`);
      setProvider(response.data.data);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`/admin/providers/${params.id}/services`);
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Provider not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Providers
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {provider.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{provider.name}</h1>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>📧 {provider.email}</p>
              {provider.phone && <p>📱 {provider.phone}</p>}
              {provider.city && <p>📍 {provider.city}</p>}
              {provider.website && <p>🌐 <a href={provider.website} target="_blank" className="text-blue-600 hover:underline">{provider.website}</a></p>}
            </div>
            <div className="flex gap-2 mt-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${provider.is_approved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                {provider.is_approved ? 'Approved' : 'Pending'}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${provider.is_active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {provider.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {provider.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{provider.bio}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Services ({services.length})</h2>
        {services.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">No services added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.prestation_type?.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.price_range}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                {service.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{service.description}</p>}
                {service.experience_years && <p className="text-gray-600 dark:text-gray-400 text-sm">Experience: {service.experience_years} years</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
