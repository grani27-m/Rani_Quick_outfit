import api from './axios';

export const shadeaiAPI = {
  detect: (imageBase64, mimeType) => api.post('/shadeai/detect', { imageBase64, mimeType }),
  getTones: () => api.get('/shadeai/tones'),
  getRecommendations: (tone) => api.get(`/shadeai/recommendations/${tone}`),
};
