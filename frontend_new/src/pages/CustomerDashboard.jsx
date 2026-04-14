import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ordersAPI } from '../api/orders.api';
import { wishlistAPI } from '../api/wishlist.api';
import { ORDER_STATUSES } from '../data/constants';
import { Package, Heart, User, Star, MapPin, Settings, LogOut, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getAll().catch(() => ({ data: [] })),
      wishlistAPI.get().catch(() => ({ data: { products: [] } })),
    ]).then(([ordRes, wishRes]) => {
      setOrders(ordRes.data || []);
      setWishlist(wishRes.data?.products || []);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'loyalty', label: 'Loyalty Points', icon: <Award size={18} /> },
  ];

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <div className="sidebar-logo">Quick<span>Outfit</span></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || '👤'}</div>
          <div><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">Customer</div></div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button key={item.id} className={`sidebar-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
          <div className="sidebar-section">Account</div>
          <button className="sidebar-item" onClick={handleLogout} style={{ color: '#E53E3E' }}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {tab === 'orders' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">My Orders</h1><p className="dash-sub">{orders.length} orders</p></div>
            {loading ? <div className="loading-page"><div className="spinner"></div></div> : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => {
                  const sc = ORDER_STATUSES[order.status] || {};
                  return (
                    <div key={order._id} className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => navigate(`/track/${order._id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>#{order._id?.slice(-8).toUpperCase()}</span>
                        <span className="badge" style={{ background: `${sc.color}15`, color: sc.color }}>{sc.icon} {sc.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.items?.map((i) => i.name).join(', ')}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
                        <span style={{ fontWeight: 800, color: 'var(--amber)' }}>₹{order.totalAmount?.toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>No orders yet</p>}
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Wishlist</h1><p className="dash-sub">{wishlist.length} items</p></div>
            {wishlist.length > 0 ? (
              <div className="products-grid">
                {wishlist.map((p) => (
                  <div key={p._id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate(`/product/${p._id}`)}>
                    <div style={{ aspectRatio: '3/4', borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 48 }}>{p.emoji || '👗'}</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>₹{p.price?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>Wishlist empty</p>}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Profile</h1></div>
            <div className="card" style={{ padding: 32, maxWidth: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'var(--rust)' }}>{user?.name?.[0]}</div>
                <div><h3 style={{ fontWeight: 700 }}>{user?.name}</h3><p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.email}</p></div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}><strong>Phone:</strong> {user?.phone || 'Not set'}</div>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}><strong>Skin Tone:</strong> {user?.skinTone || 'Not detected'}</div>
                <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}><strong>Loyalty Points:</strong> {user?.loyaltyPoints || 0} pts</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'loyalty' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Loyalty Program</h1></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">🏆</div><div className="stat-value">{user?.loyaltyPoints || 0}</div><div className="stat-label">Total Points</div></div>
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">₹{Math.floor((user?.loyaltyPoints || 0) / 10)}</div><div className="stat-label">Redeemable Value</div></div>
              <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">{orders.length}</div><div className="stat-label">Orders Placed</div></div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>How it Works</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li style={{ fontSize: 14, padding: 10, background: 'var(--cream)', borderRadius: 8 }}>🛍️ Earn 1 point for every ₹100 spent</li>
                <li style={{ fontSize: 14, padding: 10, background: 'var(--cream)', borderRadius: 8 }}>💎 10 points = ₹1 discount on checkout</li>
                <li style={{ fontSize: 14, padding: 10, background: 'var(--cream)', borderRadius: 8 }}>🎉 Bonus points on first order and referrals</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
