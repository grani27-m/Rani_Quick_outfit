import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data, data.token, data.refreshToken);
      toast.success(`Welcome back, ${data.name}!`);
      onSuccess?.();
      
      const map = { customer: '/dashboard', shopkeeper: '/shop-dashboard', delivery: '/delivery-dashboard', admin: '/admin' };
      navigate(map[data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="modal-title">Welcome Back</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>Log in to your QuickOutfit account</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Login as (optional)</label>
          <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">Auto-detect</option>
            <option value="customer">Customer</option>
            <option value="shopkeeper">Shopkeeper</option>
            <option value="delivery">Delivery Partner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
        Don't have an account? <button onClick={onSwitchToRegister} style={{ color: 'var(--amber)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Sign Up</button>
      </p>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        Demo: admin@quickoutfit.com / admin123
      </p>
    </div>
  );
}
