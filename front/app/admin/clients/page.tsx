'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { User } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/admin/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: number) => {
    if (!confirm('Are you sure you want to suspend this client?')) return;
    try {
      await axios.post(`/admin/clients/${id}/suspend`);
      fetchClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error suspending client');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await axios.post(`/admin/clients/${id}/activate`);
      fetchClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error activating client');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this client? This action cannot be undone.')) return;
    try {
      await axios.delete(`/admin/clients/${id}`);
      fetchClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage client accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clients.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clients.filter(c => !c.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{client.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{client.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    client.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {client.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              {/* Suspend/Activate button */}
              {client.is_active ? (
                <button
                  onClick={() => handleSuspend(client.id)}
                  className="w-full px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(client.id)}
                  className="w-full px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activate Account
                </button>
              )}
              
              {/* Delete button */}
              <button
                onClick={() => handleDelete(client.id)}
                className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-800 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No clients found</p>
        </div>
      )}
    </div>
  );
}
