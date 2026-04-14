import api from './axios';

export const chatAPI = {
  sendMessage: (message, chatHistory, contextData) => 
    api.post('/chat', { message, chatHistory, contextData })
};
