import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { shopsAPI } from '../api/shops.api';
import { productsAPI } from '../api/products.api';
import { ordersAPI } from '../api/orders.api';
import { ORDER_STATUSES, CATEGORIES } from '../data/constants';
import { Store, Package, ShoppingBag, BarChart3, Plus, LogOut, Edit, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const CITIES = ['Vellore', 'Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'];

export default function ShopkeeperDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.initialTab || 'overview');
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: 'kurta', sizes: ['M', 'L'], fabricType: 'cotton', stock: 20, images: [] });
  const [shopForm, setShopForm] = useState({ name: '', description: '', category: 'ethnic', address: '', city: 'Vellore', openTime: '09:00', closeTime: '21:00' });
  const [registeringShop, setRegisteringShop] = useState(false);

  const shop = shops[0] || null;

  useEffect(() => {
    Promise.all([
      shopsAPI.getMine().catch(() => ({ data: [] })),
      productsAPI.getAll().catch(() => ({ data: { products: [] } })),
      ordersAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([shopRes, prodRes, ordRes]) => {
      const myShops = shopRes.data || [];
      setShops(myShops);
      const shopIds = myShops.map((s) => s._id);
      setProducts((prodRes.data?.products || []).filter((p) => shopIds.includes(p.shopId?._id || p.shopId)));
      setOrders(ordRes.data || []);
      setLoading(false);
    });
  }, []);

  const handleRegisterShop = async (e) => {
    e.preventDefault();
    if (!shopForm.name) return toast.error('Shop name is required');
    setRegisteringShop(true);
    try {
      const { data } = await shopsAPI.create(shopForm);
      setShops([data]);
      toast.success('Shop registered! Pending admin approval.');
      setTab('shop');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register shop');
    } finally {
      setRegisteringShop(false);
    }
  };

  const handleAddProduct = async () => {
    if (!shop) return toast.error('Register your shop first');
    if (!newProduct.name || !newProduct.price) return toast.error('Fill required fields');
    try {
      await productsAPI.create({ ...newProduct, price: Number(newProduct.price) });
      toast.success('Product added!');
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', category: 'kurta', sizes: ['M', 'L'], fabricType: 'cotton', stock: 20, images: [] });
      const { data } = await productsAPI.getAll();
      const shopIds = shops.map((s) => s._id);
      setProducts((data?.products || []).filter((p) => shopIds.includes(p.shopId?._id || p.shopId)));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Failed'); }
  };

  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
    { id: 'shop', label: 'My Shop', icon: <Store size={18} /> },
  ];

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <div className="sidebar-logo">Quick<span>Outfit</span></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">🏪</div>
          <div><div className="sidebar-user-name">{user?.name}</div><div className="sidebar-user-role">Shopkeeper</div></div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button key={item.id} className={`sidebar-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
          <div className="sidebar-section">Account</div>
          <button className="sidebar-item" onClick={() => { logout(); navigate('/'); }} style={{ color: '#E53E3E' }}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Pending approval banner */}
        {shop && !shop.approved && (
          <div className="card" style={{ padding: 16, marginBottom: 20, background: '#FFF3E0', border: '1px solid #FFB74D', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color="#F57C00" />
            <div>
              <span style={{ fontWeight: 700, color: '#E65100' }}>Shop Pending Approval</span>
              <span style={{ fontSize: 13, color: '#BF360C', marginLeft: 8 }}>Your shop is awaiting admin verification. Products will go live once approved.</span>
            </div>
          </div>
        )}

        {tab === 'overview' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Dashboard</h1><p className="dash-sub">Welcome, {user?.name}</p></div>
            {!shop && (
              <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)', border: '2px dashed #FFB74D' }}>
                <Store size={48} color="#F57C00" style={{ marginBottom: 12 }} />
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Register Your Shop First</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>You need to register your shop before you can add products or receive orders.</p>
                <button className="btn btn-primary" onClick={() => setTab('shop')}>Go to My Shop →</button>
              </div>
            )}
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div>
              <div className="stat-card"><div className="stat-icon">🛍️</div><div className="stat-value">{products.length}</div><div className="stat-label">Products</div></div>
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">₹{totalRevenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div>
              <div className="stat-card"><div className="stat-icon">🏪</div><div className="stat-value">{shops.length}</div><div className="stat-label">Shops</div></div>
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
            {orders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No orders yet. Add products and wait for customers!</p>}
            {orders.slice(0, 5).map((order) => {
              const sc = ORDER_STATUSES[order.status] || {};
              return (
                <div key={order._id} className="card" style={{ padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>#{order._id?.slice(-6)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 12 }}>{order.items?.length} items · ₹{order.totalAmount}</span>
                  </div>
                  <span className="badge" style={{ background: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><h1 className="dash-title">Products</h1><p className="dash-sub">{products.length} products</p></div>
              {shop ? (
                <button className="btn btn-primary" onClick={() => setShowAddProduct(!showAddProduct)}><Plus size={16} /> Add Product</button>
              ) : (
                <button className="btn btn-primary" onClick={() => setTab('shop')} style={{ background: '#999' }}>Register Shop First</button>
              )}
            </div>

            {!shop && (
              <div className="card" style={{ padding: 32, textAlign: 'center', background: '#FFF3E0', border: '1px dashed #FFB74D' }}>
                <AlertTriangle size={32} color="#F57C00" style={{ marginBottom: 8 }} />
                <p style={{ fontWeight: 600, marginBottom: 8 }}>You must register your shop before adding products</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('shop')}>Register your shop → Go to My Shop</button>
              </div>
            )}

            {showAddProduct && shop && (
              <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add New Product</h3>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Price (₹)</label><input className="form-input" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} /></div>
                </div>
                <button className="btn btn-primary" onClick={handleAddProduct}>Save Product</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map((p) => (
                <div key={p._id} className="card" style={{ padding: 16 }}>
                  <div style={{ aspectRatio: '1', borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40 }}>{p.emoji || '👗'}</span>}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>₹{p.price}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className="badge badge-green">Stock: {p.stock}</span>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><Edit size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">Orders</h1></div>
            {orders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>No orders yet.</p>}
            {orders.map((order) => {
              const sc = ORDER_STATUSES[order.status] || {};
              const nextStatus = { placed: 'confirmed', confirmed: 'packed', packed: 'picked', picked: 'out-for-delivery' };
              return (
                <div key={order._id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>#{order._id?.slice(-8)}</span>
                      <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{order.customerId?.name}</span>
                    </div>
                    <span className="badge" style={{ background: `${sc.color}15`, color: sc.color }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--amber)' }}>₹{order.totalAmount}</span>
                    {nextStatus[order.status] && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateOrderStatus(order._id, nextStatus[order.status])}>
                        Mark as {ORDER_STATUSES[nextStatus[order.status]]?.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'shop' && (
          <div>
            <div className="dash-header"><h1 className="dash-title">My Shop</h1></div>
            {shop ? (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700 }}>{shop.name}</h2>
                  <span className={`badge ${shop.approved ? 'badge-green' : 'badge-amber'}`}>{shop.approved ? 'Approved' : 'Pending Approval'}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{shop.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}>📍 {shop.address}</div>
                  <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}>⭐ {shop.rating?.toFixed(1) || 'N/A'} rating</div>
                  <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}>🏷️ {shop.category}</div>
                  <div style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 14 }}>🕐 {shop.operatingHours?.open || '09:00'} - {shop.operatingHours?.close || '21:00'}</div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 32 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Store size={48} color="var(--amber)" style={{ marginBottom: 12 }} />
                  <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Register Your Shop</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Complete your shop profile to start selling on QuickOutfit</p>
                </div>
                <form onSubmit={handleRegisterShop}>
                  <div className="form-group">
                    <label className="form-label">Shop Name *</label>
                    <input className="form-input" placeholder="e.g. Rani's Boutique" required value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Describe your shop and what you sell..." value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={shopForm.category} onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}>
                        <option value="ethnic">Ethnic</option><option value="western">Western</option>
                        <option value="saree">Saree</option><option value="kurta">Kurta</option>
                        <option value="casual">Casual</option><option value="formal">Formal</option>
                        <option value="kids">Kids</option><option value="mens">Mens</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <select className="form-select" value={shopForm.city} onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Street Address</label>
                    <input className="form-input" placeholder="e.g. 12, Main Bazaar Road, Near VIT" value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Opening Time</label>
                      <input className="form-input" type="time" value={shopForm.openTime} onChange={(e) => setShopForm({ ...shopForm, openTime: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Closing Time</label>
                      <input className="form-input" type="time" value={shopForm.closeTime} onChange={(e) => setShopForm({ ...shopForm, closeTime: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={registeringShop} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                    {registeringShop ? 'Registering...' : '🏪 Register My Shop'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

