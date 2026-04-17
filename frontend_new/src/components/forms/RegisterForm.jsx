import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'customer' }
  });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const roleValue = watch("role", "customer");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const resp = await authAPI.register(data);
      const resData = resp.data || resp;
      login(resData, resData.token, resData.refreshToken);
      toast.success(`Welcome to QuickOutfit, ${resData.name}!`);
      onSuccess?.();
      
      const map = { customer: '/dashboard', shopkeeper: '/shop-dashboard', delivery: '/delivery-dashboard', admin: '/admin' };
      
      if (resData.role === 'shopkeeper') {
        navigate('/shop-dashboard', { state: { initialTab: 'shop' } });
      } else {
        navigate(map[resData.role] || '/');
      }
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            className="form-input" 
            placeholder="Your name" 
            style={{ borderColor: errors.name ? '#E53E3E' : undefined }}
            {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })} 
          />
          {errors.name && <span className="form-error">{errors.name.message}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input" 
              type="email" 
              placeholder="you@example.com" 
              style={{ borderColor: errors.email ? '#E53E3E' : undefined }}
              {...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })} 
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input 
              className="form-input" 
              placeholder="9876543210" 
              style={{ borderColor: errors.phone ? '#E53E3E' : undefined }}
              {...register("phone", { required: "Phone is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit number" } })} 
            />
            {errors.phone && <span className="form-error">{errors.phone.message}</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password (min 8 chars)</label>
          <input 
            className="form-input" 
            type="password" 
            placeholder="••••••••" 
            style={{ borderColor: errors.password ? '#E53E3E' : undefined }}
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })} 
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <select 
            className="form-select" 
            {...register("role", { required: "Select a role" })}
          >
            <option value="customer">Customer — Shop & Discover</option>
            <option value="shopkeeper">Shopkeeper — Sell Online</option>
            <option value="delivery">Delivery Partner — Earn Money</option>
          </select>
        </div>
        {roleValue === 'shopkeeper' && (
          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input 
              className="form-input" 
              placeholder="Your boutique name" 
              {...register("shopName")} 
            />
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
