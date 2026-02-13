'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function CreateCollectionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/client/collections', formData);
      router.push('/client/collections');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating collection');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collections
      </button>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Create New Collection</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Collection Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="e.g., Wedding Vendors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="Describe your collection..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-white/80">
              Make this collection public (others can view it)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
