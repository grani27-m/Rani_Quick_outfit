import api from './axios';

export const shopsAPI = {
  getAll: (params = {}) => api.get('/shops', { params }),
  getNearby: (lat, lng, radius) => api.get('/shops/nearby', { params: { lat, lng, radius } }),
  getById: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.patch(`/shops/${id}`, data),
  getMine: () => api.get('/shops/owner/mine'),
  approve: (id) => api.post(`/shops/${id}/approve`),
  reject: (id, reason) => api.post(`/shops/${id}/reject`, { reason }),
  getPending: () => api.get('/shops/status/pending'),
  getAnalytics: (id) => api.get(`/shops/${id}/analytics`),
};
