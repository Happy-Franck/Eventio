'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { User } from '@/lib/types';

interface Provider extends Omit<User, 'prestation_types'> {
  prestation_types?: Array<{ id: number; name: string; is_active?: boolean }>;
  services_count?: number;
  siret?: string;
  email_verified_at?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  is_available: boolean;
  prestation_type?: { id: number; name: string };
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'services'>('profile');

  useEffect(() => {
    fetchProviderDetails();
    fetchServices();
  }, [params.id]);

  const fetchProviderDetails = async () => {
    try {
      const response = await axios.get(`/admin/providers/${params.id}`);
      setProvider(response.data.data);
    } catch (error) {
      console.error('Error fetching provider:', error);
      alert('Error loading provider details');
      router.push('/admin/providers');
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

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this provider?')) return;
    try {
      await axios.post(`/admin/providers/${params.id}/approve`);
      fetchProviderDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error approving provider');
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this provider?')) return;
    try {
      await axios.post(`/admin/providers/${params.id}/reject`);
      fetchProviderDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error rejecting provider');
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
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/providers')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage provider details</p>
        </div>
      </div>

      {/* Provider Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {provider.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{provider.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{provider.email}</p>
              </div>
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  provider.is_approved && provider.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : !provider.is_active
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {provider.is_approved && provider.is_active
                  ? 'Approved'
                  : !provider.is_active
                  ? 'Rejected'
                  : 'Pending Approval'}
              </span>
            </div>

            {/* Action Buttons */}
            {!provider.is_approved && provider.is_active && (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Provider
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reject Provider
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'profile'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'services'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Services ({services.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{provider.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">{provider.email}</p>
                  </div>
                  {provider.phone && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="text-gray-900 dark:text-white font-medium">{provider.phone}</p>
                    </div>
                  )}
                  {provider.address && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="text-gray-900 dark:text-white font-medium">{provider.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              {(provider.company_name || provider.siret || provider.bio) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.company_name && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Company Name</p>
                        <p className="text-gray-900 dark:text-white font-medium">{provider.company_name}</p>
                      </div>
                    )}
                    {provider.siret && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">SIRET</p>
                        <p className="text-gray-900 dark:text-white font-medium">{provider.siret}</p>
                      </div>
                    )}
                    {provider.bio && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</p>
                        <p className="text-gray-900 dark:text-white">{provider.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prestation Types */}
              {provider.prestation_types && provider.prestation_types.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Prestation Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.prestation_types.map((type) => (
                      <span
                        key={type.id}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium"
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email Verified</p>
                    <p className={`font-medium ${provider.email_verified_at ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {provider.email_verified_at ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Active</p>
                    <p className={`font-medium ${provider.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {provider.is_active ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                    <p className={`font-medium ${provider.is_approved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {provider.is_approved ? 'Yes' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Date */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Registration</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Member Since</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No services yet</p>
                </div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          service.is_available
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {service.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${service.price_min} - ${service.price_max}
                        </span>
                      </div>
                      {service.prestation_type && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">Type:</span>
                          <span className="text-gray-900 dark:text-white">{service.prestation_type.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
