import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { adminAPI } from '../api/admin.api';
import { ORDER_STATUSES } from '../data/constants';
import { BarChart3, Users, Store, Package, FileText, Shield, LogOut, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingShops, setPendingShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getStats().catch(() => ({ data: {} })),
      adminAPI.getUsers().catch(() => ({ data: { users: [] } })),
      adminAPI.getPendingShops().catch(() => ({ data: [] })),
      adminAPI.getOrders().catch(() => ({ data: { orders: [] } })),
    ]).then(([statsRes, usersRes, shopsRes, ordersRes]) => {
      setStats(statsRes.data || {});
      setUsers(usersRes.data?.users || []);
      setPendingShops(shopsRes.data || []);
      setOrders(ordersRes.data?.orders || []);
      setLoading(false);
    });
  }, []);

  const handleApproveShop = async (id) => {
    try {
      await adminAPI.approveShop(id);
      setPendingShops(pendingShops.filter((s) => s._id !== id));
      toast.success('Shop approved!');
    } catch { toast.error('Failed'); }
  };

  const handleBlockUser = async (id) => {
    try {
      await adminAPI.blockUser(id);
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'shops', label: 'Shop Approvals', icon: <Store size={18} />, badge: pendingShops.length },
    { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
  ];

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <div className="sidebar-logo">Quick<span>Outfit</span></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">👨‍💼</div>
          <div><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">Admin</div></div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button key={item.id} className={`sidebar-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
              {item.icon} {item.label}
              {item.badge > 0 && <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px' }}>{item.badge}</span>}
            </button>
          ))}
          <div className="sidebar-section">Account</div>
          <button className="sidebar-item" onClick={() => { logout(); navigate('/'); }} style={{ color: '#E53E3E' }}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {tab === 'overview' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Admin Dashboard</h1><p className="dash-sub">Platform overview — real-time stats</p></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
              <div className="stat-card"><div className="stat-icon">🏪</div><div className="stat-value">{stats.approvedShops || 0}</div><div className="stat-label">Active Shops</div></div>
              <div className="stat-card"><div className="stat-icon">🛍️</div><div className="stat-value">{stats.totalProducts || 0}</div><div className="stat-label">Products</div></div>
              <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">{stats.totalOrders || 0}</div><div className="stat-label">Total Orders</div></div>
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</div><div className="stat-label">Revenue</div></div>
              <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">{stats.pendingShops || 0}</div><div className="stat-label">Pending Shops</div></div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>User Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div style={{ padding: 16, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.totalCustomers || 0}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Customers</p>
                </div>
                <div style={{ padding: 16, background: 'var(--amber-pale)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.totalShopkeepers || 0}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Shopkeepers</p>
                </div>
                <div style={{ padding: 16, background: 'var(--sky-light)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.deliveredOrders || 0}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delivered</p>
                </div>
                <div style={{ padding: 16, background: 'var(--sage-light)', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.totalShops || 0}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Shops</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Users</h1><p className="dash-sub">{users.length} users</p></div>
            <div className="card" style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '10px 16px' }}><span className="badge badge-amber">{u.role}</span></td>
                      <td style={{ padding: '10px 16px' }}><span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-red'}`}>{u.isActive !== false ? 'Active' : 'Blocked'}</span></td>
                      <td style={{ padding: '10px 16px' }}><button className={`btn btn-sm ${u.isActive !== false ? 'btn-danger' : 'btn-success'}`} onClick={() => handleBlockUser(u._id)}>{u.isActive !== false ? 'Block' : 'Unblock'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'shops' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Shop Approvals</h1><p className="dash-sub">{pendingShops.length} pending</p></div>
            {pendingShops.length > 0 ? pendingShops.map((shop) => (
              <div key={shop._id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontWeight: 700 }}>{shop.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Owner: {shop.ownerId?.name} · {shop.ownerId?.email}</p>
                  </div>
                  <span className="badge badge-amber">{shop.category}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{shop.description || 'No description'}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleApproveShop(shop._id)}><Check size={14} /> Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => toast('Reject feature — enter reason')}><X size={14} /> Reject</button>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>No pending approvals</p>}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">All Orders</h1><p className="dash-sub">{orders.length} orders</p></div>
            {orders.map((order) => {
              const sc = ORDER_STATUSES[order.status] || {};
              return (
                <div key={order._id} className="card" style={{ padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>#{order._id?.slice(-8)}</span>
                    <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{order.customerId?.name} · {order.shopId?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700 }}>₹{order.totalAmount}</span>
                    <span className="badge" style={{ background: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
