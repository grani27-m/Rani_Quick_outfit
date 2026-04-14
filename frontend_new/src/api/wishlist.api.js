import api from './axios';

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId, data) => api.post(`/wishlist/${productId}/move-to-cart`, data),
  clear: () => api.delete('/wishlist'),
};
