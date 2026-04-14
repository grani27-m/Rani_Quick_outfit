import api from './axios';

export const paymentsAPI = {
  createOrder: (amount, receipt) => api.post('/payments/create-order', { amount, receipt }),
  verify: (data) => api.post('/payments/verify', data),
  getStatus: (orderId) => api.get(`/payments/${orderId}`),
};
