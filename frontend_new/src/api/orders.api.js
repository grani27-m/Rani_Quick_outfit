import api from './axios';

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  verifyOtp: (id, otp) => api.post(`/orders/${id}/verify-otp`, { otp }),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }),
  assignDelivery: (id, deliveryPartnerId) => api.patch(`/orders/${id}/assign-delivery`, { deliveryPartnerId }),
};
