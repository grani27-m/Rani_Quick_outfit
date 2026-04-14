import api from './axios';

export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getNearby: (lat, lng, radius = 5000) => api.get('/products/nearby', { params: { lat, lng, radius } }),
  search: (q) => api.get('/products', { params: { search: q } }),
  getFeatured: () => api.get('/products/featured/all'),
  getTrending: () => api.get('/products/trending/all'),
  getByTone: (tone) => api.get(`/products/tone/${tone}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getRecommendations: () => api.get('/products/ai/recommendations'),
};
