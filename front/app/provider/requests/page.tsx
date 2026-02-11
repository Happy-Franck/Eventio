'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { TeamSelection } from '@/lib/types';

export default function RequestsPage() {
  const [requests, setRequests] = useState<TeamSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`/provider/requests${params}`);
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await axios.post(`/provider/requests/${id}/accept`);
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await axios.post(`/provider/requests/${id}/reject`);
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Client Requests</h1>
        <p className="text-white/60 mt-2">Manage requests from clients for your services</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2">
        {(['all', 'pending', 'confirmed', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-purple-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-white/60">No {filter !== 'all' ? filter : ''} requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {request.prestation_type?.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  {request.estimated_price && (
                    <p className="text-white/60 mb-2">
                      Estimated Price: ${request.estimated_price.toLocaleString()}
                    </p>
                  )}

                  {request.notes && (
                    <p className="text-white/80 text-sm mb-3">
                      <span className="font-medium">Client Notes:</span> {request.notes}
                    </p>
                  )}

                  <div className="text-sm text-white/60">
                    Request ID: #{request.id}
                  </div>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="flex-1 px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 font-medium hover:bg-green-500/30 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 px-6 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 font-medium hover:bg-red-500/30 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
