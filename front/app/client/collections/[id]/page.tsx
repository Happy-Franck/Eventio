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
    if (!confirm('Retirer ce prestataire de la collection?')) return;
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
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center text-gray-500 py-12 font-medium">Collection introuvable</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Détails de la Collection</h1>
          <p className="text-gray-500 mt-1">Prestataires dans cette collection</p>
        </div>
      </div>

      {/* Collection Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{collection.name}</h2>
            {collection.description && (
              <p className="text-gray-600 mt-2 leading-relaxed">{collection.description}</p>
            )}
            {collection.category && (
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">{collection.category.name}</p>
              </div>
            )}
          </div>
          {collection.is_public && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Public
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm font-medium">
          {collection.items?.length || 0} prestataire(s) dans cette collection
        </p>
      </div>

      {/* Items */}
      {collection.items && collection.items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">Aucun prestataire dans cette collection</p>
          <p className="text-gray-400 text-sm mb-6">Parcourez les prestataires et ajoutez-les à cette collection</p>
          <button
            onClick={() => router.push('/client/providers')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Parcourir les Prestataires
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.items?.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                  {item.provider.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{item.provider.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.provider.email}</p>
                  {item.provider.city && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-500">{item.provider.city}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {item.prestation_type.name}
                </span>
              </div>

              {item.provider.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{item.provider.bio}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/client/providers/${item.provider.id}`)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Voir le profil
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition"
                  title="Retirer de la collection"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
