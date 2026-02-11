'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { ProviderService, PrestationType } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [formData, setFormData] = useState({
    prestation_type_id: '',
    price_min: '',
    price_max: '',
    description: '',
    experience_years: '',
    is_available: true,
  });

  useEffect(() => {
    fetchServices();
    fetchPrestationTypes();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/provider/services');
      setServices(response.data.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrestationTypes = async () => {
    try {
      const response = await axios.get('/prestation-types');
      setPrestationTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch prestation types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`/provider/services/${editingService.id}`, formData);
      } else {
        await axios.post('/provider/services', formData);
      }
      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service: ProviderService) => {
    setEditingService(service);
    setFormData({
      prestation_type_id: service.prestation_type_id.toString(),
      price_min: service.price_min?.toString() || '',
      price_max: service.price_max?.toString() || '',
      description: service.description || '',
      experience_years: service.experience_years?.toString() || '',
      is_available: service.is_available,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`/provider/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Failed to delete service');
    }
  };

  const toggleAvailability = async (service: ProviderService) => {
    try {
      await axios.patch(`/provider/services/${service.id}/toggle-availability`);
      fetchServices();
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  const resetForm = () => {
    setFormData({
      prestation_type_id: '',
      price_min: '',
      price_max: '',
      description: '',
      experience_years: '',
      is_available: true,
    });
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Services</h1>
          <p className="text-white/60 mt-2">Manage your service offerings</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
        >
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-white/60 mb-4">You haven't added any services yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
          >
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{service.prestation_type?.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{service.price_range}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.is_available
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {service.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {service.description && (
                <p className="text-white/80 text-sm mb-4">{service.description}</p>
              )}

              {service.experience_years && (
                <p className="text-white/60 text-sm mb-4">
                  Experience: {service.experience_years} years
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleAvailability(service)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition"
                >
                  {service.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Service Type *
                </label>
                <select
                  required
                  value={formData.prestation_type_id}
                  onChange={(e) => setFormData({ ...formData, prestation_type_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select a service type</option>
                  {prestationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={formData.price_min}
                    onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={formData.price_max}
                    onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-white/80">
                  Available for bookings
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
