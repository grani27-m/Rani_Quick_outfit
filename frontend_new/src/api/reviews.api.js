import api from './axios';

export const reviewsAPI = {
  getByProduct: (productId, params = {}) => api.get(`/reviews/product/${productId}`, { params }),
  getByShop: (shopId, params = {}) => api.get(`/reviews/shop/${shopId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};
