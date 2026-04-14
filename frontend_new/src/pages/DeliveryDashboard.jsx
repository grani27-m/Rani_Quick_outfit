import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { ordersAPI } from '../api/orders.api';
import { ORDER_STATUSES } from '../data/constants';
import { Truck, Package, DollarSign, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll().then(({ data }) => { setOrders(data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const availableOrders = orders.filter((o) => ['packed', 'confirmed'].includes(o.status) && !o.deliveryPartnerId);
  const myOrders = orders.filter((o) => o.deliveryPartnerId?._id === user?._id || o.deliveryPartnerId === user?._id);
  const delivered = myOrders.filter((o) => o.status === 'delivered');
  const earnings = delivered.length * 30; // ₹30 per delivery

  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.assignDelivery(orderId, user._id);
      await ordersAPI.updateStatus(orderId, { status: 'picked' });
      toast.success('Order accepted!');
      setOrders(orders.map((o) => o._id === orderId ? { ...o, deliveryPartnerId: user._id, status: 'picked' } : o));
    } catch { toast.error('Failed'); }
  };

  const handleVerifyOTP = async (orderId) => {
    const otp = prompt('Enter delivery OTP:');
    if (!otp) return;
    try {
      await ordersAPI.verifyOtp(orderId, otp);
      toast.success('Delivery confirmed!');
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: 'delivered' } : o));
    } catch { toast.error('Invalid OTP'); }
  };

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <div className="sidebar-logo">Quick<span>Outfit</span></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">🚚</div>
          <div><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">Delivery Partner</div></div>
        </div>
        <div className="sidebar-menu">
          <button className={`sidebar-item ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}><Package size={18} /> Available ({availableOrders.length})</button>
          <button className={`sidebar-item ${tab === 'assigned' ? 'active' : ''}`} onClick={() => setTab('assigned')}><Truck size={18} /> My Deliveries</button>
          <button className={`sidebar-item ${tab === 'earnings' ? 'active' : ''}`} onClick={() => setTab('earnings')}><DollarSign size={18} /> Earnings</button>
          <div className="sidebar-section">Account</div>
          <button className="sidebar-item" onClick={() => { logout(); navigate('/'); }} style={{ color: '#E53E3E' }}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">{availableOrders.length}</div><div className="stat-label">Available</div></div>
          <div className="stat-card"><div className="stat-icon">🚚</div><div className="stat-value">{myOrders.length}</div><div className="stat-label">Assigned</div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{delivered.length}</div><div className="stat-label">Delivered</div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">₹{earnings}</div><div className="stat-label">Earnings</div></div>
        </div>

        {tab === 'available' && (
          <div>
            <h2 className="dash-title">Available Orders</h2>
            {availableOrders.length > 0 ? availableOrders.map((order) => (
              <div key={order._id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>#{order._id?.slice(-8)}</span>
                  <span style={{ fontWeight: 800, color: 'var(--amber)' }}>₹{order.totalAmount}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}><MapPin size={12} style={{ display: 'inline' }} /> {order.deliveryAddress?.address || 'Address pending'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{order.items?.length} items from {order.shopId?.name}</p>
                <button className="btn btn-primary btn-sm" onClick={() => handleAcceptOrder(order._id)}>Accept Delivery</button>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No available orders</p>}
          </div>
        )}

        {tab === 'assigned' && (
          <div>
            <h2 className="dash-title">My Deliveries</h2>
            {myOrders.map((order) => {
              const sc = ORDER_STATUSES[order.status] || {};
              return (
                <div key={order._id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>#{order._id?.slice(-8)}</span>
                    <span className="badge" style={{ background: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}><MapPin size={12} style={{ display: 'inline' }} /> {order.deliveryAddress?.address}</p>
                  {order.status !== 'delivered' && (
                    <button className="btn btn-success btn-sm" style={{ marginTop: 8 }} onClick={() => handleVerifyOTP(order._id)}>Verify OTP & Complete</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'earnings' && (
          <div>
            <h2 className="dash-title">Earnings</h2>
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--amber)' }}>₹{earnings}</p>
              <p style={{ color: 'var(--text-secondary)' }}>Total earnings from {delivered.length} deliveries</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>₹30 per delivery</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
