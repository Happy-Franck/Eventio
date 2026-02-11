'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { User } from '@/lib/types';

interface TeamProvider {
  id: number;
  provider: User;
  prestation_type: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<TeamProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // Récupérer ou créer la team
      const teamsResponse = await axios.get('/client/teams');
      let favTeam = teamsResponse.data.data.find((t: any) => t.event_name === 'My Team');
      
      if (!favTeam) {
        // Créer automatiquement la team
        const createResponse = await axios.post('/client/teams', {
          event_name: 'My Team',
          status: 'draft'
        });
        favTeam = createResponse.data.data;
      }
      
      setTeamId(favTeam.id);
      
      // Charger les favoris
      const detailsResponse = await axios.get(`/client/teams/${favTeam.id}`);
      setFavorites(detailsResponse.data.data.selections || []);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (selectionId: number) => {
    if (!confirm('Remove this provider from your team?')) return;
    try {
      await axios.delete(`/client/teams/${teamId}/selections/${selectionId}`);
      fetchFavorites();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error removing provider');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Team</h1>
        <p className="text-white/60 mt-2">Providers you've saved for your event</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Total in Team</p>
              <p className="text-2xl font-bold text-white">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Providers</p>
              <p className="text-2xl font-bold text-white">{new Set(favorites.map(f => f.provider.id)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Service Types</p>
              <p className="text-2xl font-bold text-white">{new Set(favorites.map(f => f.prestation_type.id)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <p className="text-white/60 mb-4">No providers in your team yet</p>
          <p className="text-white/40 text-sm mb-6">Browse providers and add them to your team</p>
          <button
            onClick={() => router.push('/client/providers')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
          >
            Browse Providers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {favorite.provider.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{favorite.provider.name}</h3>
                  <p className="text-sm text-white/60">{favorite.provider.email}</p>
                  {favorite.provider.city && (
                    <p className="text-sm text-white/60 mt-1">📍 {favorite.provider.city}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
                  {favorite.prestation_type.name}
                </span>
              </div>

              {favorite.provider.bio && (
                <p className="text-sm text-white/80 mb-4 line-clamp-2">{favorite.provider.bio}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => router.push(`/client/providers/${favorite.provider.id}`)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleRemove(favorite.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition"
                  title="Remove from team"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
