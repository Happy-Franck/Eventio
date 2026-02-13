'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

interface Collection {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  items_count: number;
  category?: { id: number; name: string };
  created_at: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('/client/collections');
      setCollections(response.data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await axios.delete(`/client/collections/${id}`);
      fetchCollections();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting collection');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Collections</h1>
          <p className="text-white/60 mt-2">Organize your favorite providers</p>
        </div>
        <button
          onClick={() => router.push('/client/collections/create')}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
        >
          Create Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Total Collections</p>
              <p className="text-2xl font-bold text-white">{collections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Public</p>
              <p className="text-2xl font-bold text-white">{collections.filter(c => c.is_public).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/60">Total Items</p>
              <p className="text-2xl font-bold text-white">{collections.reduce((sum, c) => sum + (c.items_count || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-white/60 mb-4">No collections created yet</p>
          <button
            onClick={() => router.push('/client/collections/create')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition"
          >
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                {collection.is_public && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">Public</span>
                )}
              </div>
              {collection.description && (
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{collection.description}</p>
              )}
              {collection.category && (
                <p className="text-white/60 text-sm mb-4">📁 {collection.category.name}</p>
              )}
              <p className="text-white/60 text-sm mb-4">{collection.items_count || 0} providers</p>
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => router.push(`/client/collections/${collection.id}`)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
