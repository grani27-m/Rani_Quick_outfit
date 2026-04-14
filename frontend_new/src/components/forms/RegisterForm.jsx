import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', shopName: '' });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Invalid Indian mobile number');

    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data, data.token, data.refreshToken);
      toast.success(`Welcome to QuickOutfit, ${data.name}!`);
      onSuccess?.();
      
      const map = { customer: '/dashboard', shopkeeper: '/shop-dashboard', delivery: '/delivery-dashboard', admin: '/admin' };
      navigate(map[data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="modal-title">Create Account</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>Join QuickOutfit — discover local fashion</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password (min 8 chars)</label>
          <input className="form-input" type="password" placeholder="••••••••" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="customer">Customer — Shop & Discover</option>
            <option value="shopkeeper">Shopkeeper — Sell Online</option>
            <option value="delivery">Delivery Partner — Earn Money</option>
          </select>
        </div>
        {form.role === 'shopkeeper' && (
          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input className="form-input" placeholder="Your boutique name" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
        Already have an account? <button onClick={onSwitchToLogin} style={{ color: 'var(--amber)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Log In</button>
      </p>
    </div>
  );
}
