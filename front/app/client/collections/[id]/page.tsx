'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';
import { User } from '@/lib/types';

interface CollectionItem {
  id: number;
  provider: User;
  prestation_type: { id: number; name: string };
  created_at: string;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  items: CollectionItem[];
  category?: { id: number; name: string };
}

export default function CollectionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCollection();
    }
  }, [params.id]);

  const fetchCollection = async () => {
    try {
      const response = await axios.get(`/client/collections/${params.id}`);
      setCollection(response.data.data);
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Remove this provider from collection?')) return;
    try {
      await axios.delete(`/client/collections/${params.id}/items/${itemId}`);
      fetchCollection();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error removing item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return <div className="text-center text-white/60">Collection not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collections
      </button>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
            {collection.description && (
              <p className="text-white/60 mt-2">{collection.description}</p>
            )}
            {collection.category && (
              <p className="text-white/60 mt-2">📁 {collection.category.name}</p>
            )}
          </div>
          {collection.is_public && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">Public</span>
          )}
        </div>
        <p className="text-white/80">{collection.items?.length || 0} providers in this collection</p>
      </div>

      {collection.items && collection.items.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <p className="text-white/60 mb-4">No providers in this collection yet</p>
          <button
            onClick={() => router.push('/client/providers')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition"
          >
            Browse Providers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.items?.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {item.provider.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{item.provider.name}</h3>
                  <p className="text-sm text-white/60">{item.provider.email}</p>
                  {item.provider.city && (
                    <p className="text-sm text-white/60 mt-1">📍 {item.provider.city}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-medium rounded-full">
                  {item.prestation_type.name}
                </span>
              </div>

              {item.provider.bio && (
                <p className="text-sm text-white/80 mb-4 line-clamp-2">{item.provider.bio}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => router.push(`/client/providers/${item.provider.id}`)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
