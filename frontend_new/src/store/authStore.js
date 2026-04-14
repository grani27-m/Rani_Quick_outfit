import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('qo_user') || 'null'),
  token: localStorage.getItem('qo_token') || null,

  isLoggedIn: () => !!get().token,
  getRole: () => get().user?.role || null,

  login: (userData, token, refreshToken) => {
    localStorage.setItem('qo_token', token);
    if (refreshToken) localStorage.setItem('qo_refresh_token', refreshToken);
    const user = { ...userData };
    delete user.token;
    delete user.refreshToken;
    localStorage.setItem('qo_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('qo_token');
    localStorage.removeItem('qo_refresh_token');
    localStorage.removeItem('qo_user');
    set({ user: null, token: null });
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    localStorage.setItem('qo_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
