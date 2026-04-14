import api from './axios';

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  getPendingShops: () => api.get('/admin/shops/pending'),
  approveShop: (id) => api.patch(`/admin/shops/${id}/approve`),
  rejectShop: (id, reason) => api.patch(`/admin/shops/${id}/reject`, { reason }),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getReports: (params = {}) => api.get('/admin/reports', { params }),
};
