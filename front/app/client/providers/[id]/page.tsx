'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { User, ProviderService } from '@/lib/types';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<User | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);

  useEffect(() => {
    fetchProviderDetails();
    fetchTeams();
  }, [params.id]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/client/teams?status=draft,active');
      setTeams(response.data.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchProviderDetails = async () => {
    try {
      const [providerResponse, servicesResponse] = await Promise.all([
        axios.get(`/client/providers/${params.id}`),
        axios.get(`/client/providers/${params.id}/services`)
      ]);
      
      setProvider(providerResponse.data.data);
      setServices(servicesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching provider:', error);
      alert('Error loading provider details');
      router.push('/client/providers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (serviceId: number) => {
    // TODO: Implement add to collection functionality
    alert('Add to collection feature coming soon!');
  };

  const handleAddToTeam = async (service: ProviderService) => {
    setSelectedService(service);
    setShowTeamModal(true);
  };

  const handleSelectTeam = async (teamId: number) => {
    if (!selectedService || !provider) return;
    
    try {
      await axios.post(`/client/teams/${teamId}/selections`, {
        provider_id: provider.id,
        prestation_type_id: selectedService.prestation_type_id,
        estimated_price: selectedService.price_min || null,
        notes: `Service: ${selectedService.name || 'N/A'}`,
      });
      
      setShowTeamModal(false);
      setSelectedService(null);
      alert('Provider added to team successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding to team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/client/providers')}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Provider Profile</h1>
          <p className="text-white/60 mt-2">View provider details and services</p>
        </div>
      </div>

      {/* Provider Header Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {provider.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{provider.name}</h2>
            {provider.company_name && (
              <p className="text-white/80 mt-1">{provider.company_name}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/60">
              {provider.email && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {provider.email}
                </div>
              )}
              {provider.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {provider.phone}
                </div>
              )}
              {provider.city && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {provider.city}
                </div>
              )}
            </div>
          </div>
        </div>

        {provider.bio && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">About</h3>
            <p className="text-white/80">{provider.bio}</p>
          </div>
        )}

        {provider.prestation_types && provider.prestation_types.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {provider.prestation_types.map((type) => (
                <span
                  key={type.id}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-medium"
                >
                  {type.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Available Services</h2>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-white/60">No services available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  {service.is_available ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">
                      Unavailable
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="text-white/70 mb-4 text-sm">{service.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">
                      ${service.price_min} - ${service.price_max}
                    </span>
                  </div>

                  {service.is_available && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToTeam(service)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition"
                      >
                        Add to Team
                      </button>
                      <button
                        onClick={() => handleAddToCollection(service.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                      >
                        Add to Collection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provider.email && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-1">Email</p>
              <p className="text-white font-medium">{provider.email}</p>
            </div>
          )}
          {provider.phone && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-1">Phone</p>
              <p className="text-white font-medium">{provider.phone}</p>
            </div>
          )}
          {provider.address && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-1">Address</p>
              <p className="text-white font-medium">{provider.address}</p>
            </div>
          )}
          {provider.website && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-1">Website</p>
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                {provider.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Team Selection Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Select Team</h2>
              <button
                onClick={() => {
                  setShowTeamModal(false);
                  setSelectedService(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">No teams available</p>
                  <button
                    onClick={() => router.push('/client/teams')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition"
                  >
                    Create a Team
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team: any) => (
                    <button
                      key={team.id}
                      onClick={() => handleSelectTeam(team.id)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-left"
                    >
                      <h3 className="text-lg font-bold text-white mb-1">{team.event_name}</h3>
                      {team.event_date && (
                        <p className="text-sm text-white/60">
                          📅 {new Date(team.event_date).toLocaleDateString()}
                        </p>
                      )}
                      {team.event_location && (
                        <p className="text-sm text-white/60">📍 {team.event_location}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
