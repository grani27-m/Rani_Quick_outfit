// ════════════════════════════════════════════
// QUICKOUTFIT — API SERVICE LAYER
// All communication with the backend goes through here
// ════════════════════════════════════════════

const API_BASE = 'http://localhost:5000/api';

// ── TOKEN HELPERS ──
const getToken = () => localStorage.getItem('qo_token');
const setToken = (token) => localStorage.setItem('qo_token', token);
const clearToken = () => localStorage.removeItem('qo_token');

const authHeaders = () => {
  const token = getToken();
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
};

// ── BASE FETCH ──
const request = async (method, url, data = null, isFormData = false) => {
  const options = {
    method,
    headers: isFormData
      ? { 'Authorization': `Bearer ${getToken()}` }
      : authHeaders(),
  };
  if (data) {
    options.body = isFormData ? data : JSON.stringify(data);
  }
  try {
    const res = await fetch(API_BASE + url, options);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return { ok: true, data: json };
  } catch (err) {
    console.error(`[API] ${method} ${url}`, err.message);
    return { ok: false, error: err.message };
  }
};

const api = {
  get:    (url)        => request('GET',    url),
  post:   (url, data)  => request('POST',   url, data),
  put:    (url, data)  => request('PUT',    url, data),
  patch:  (url, data)  => request('PATCH',  url, data),
  delete: (url)        => request('DELETE', url),
  upload: (url, form)  => request('POST',   url, form, true),
};

// ════════════════════════════════════════════
// AUTH API
// ════════════════════════════════════════════
const Auth = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  verifyOtp:(data) => api.post('/auth/verify-otp', data),
  me:       ()     => api.get('/auth/me'),

  // Save user data locally after login/register
  saveSession(userData) {
    setToken(userData.token);
    const user = { ...userData };
    delete user.token;
    localStorage.setItem('qo_user', JSON.stringify(user));
  },

  getSession() {
    try {
      const raw = localStorage.getItem('qo_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  clearSession() {
    clearToken();
    localStorage.removeItem('qo_user');
  },

  isLoggedIn: () => !!getToken(),
};

// ════════════════════════════════════════════
// PRODUCTS API
// ════════════════════════════════════════════
const Products = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products${qs ? '?' + qs : ''}`);
  },
  getById: (id)    => api.get(`/products/${id}`),
  create:  (data)  => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)    => api.delete(`/products/${id}`),
  getByShop: (shopId) => api.get(`/products?shopId=${shopId}`),
};

// ════════════════════════════════════════════
// SHOPS API
// ════════════════════════════════════════════
const Shops = {
  getAll: ()       => api.get('/shops'),
  getById: (id)    => api.get(`/shops/${id}`),
  getNearby: (lat, lng, radius = 10000) =>
    api.get(`/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getMyShop: ()    => api.get('/shops/my-shop'),
  update: (id, data) => api.put(`/shops/${id}`, data),
};

// ════════════════════════════════════════════
// CART API
// ════════════════════════════════════════════
const CartAPI = {
  get:    ()           => api.get('/cart'),
  add:    (data)       => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId)     => api.delete(`/cart/${itemId}`),
  clear:  ()           => api.delete('/cart'),
};

// ════════════════════════════════════════════
// ORDERS API
// ════════════════════════════════════════════
const Orders = {
  create:   (data)     => api.post('/orders', data),
  getMyOrders: ()      => api.get('/orders/my-orders'),
  getShopOrders: ()    => api.get('/orders/shop-orders'),
  getById:  (id)       => api.get(`/orders/${id}`),
  updateStatus: (id, status, note = '') =>
    api.patch(`/orders/${id}/status`, { status, note }),
  cancel:   (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
};

// ════════════════════════════════════════════
// WISHLIST API
// ════════════════════════════════════════════
const WishlistAPI = {
  get:    ()       => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
};

// ════════════════════════════════════════════
// REVIEWS API
// ════════════════════════════════════════════
const Reviews = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews', data),
};

// ════════════════════════════════════════════
// PAYMENTS API
// ════════════════════════════════════════════
const Payments = {
  createOrder: (amount, receipt) => api.post('/payments/create-order', { amount, receipt }),
  verify: (data) => api.post('/payments/verify', data),
};

// ════════════════════════════════════════════
// ADMIN API
// ════════════════════════════════════════════
const Admin = {
  getStats:  ()       => api.get('/admin/stats'),
  getUsers:  ()       => api.get('/admin/users'),
  getShops:  ()       => api.get('/admin/shops'),
  getOrders: ()       => api.get('/admin/orders'),
  approveShop: (id)   => api.patch(`/admin/shops/${id}/approve`),
  rejectShop: (id, reason) => api.patch(`/admin/shops/${id}/reject`, { reason }),
};

// Make everything globally available
window.QuickOutfitAPI = { Auth, Products, Shops, CartAPI, Orders, WishlistAPI, Reviews, Payments, Admin, api };
