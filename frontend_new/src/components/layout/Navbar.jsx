import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Bell, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useUIStore from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';

function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotificationStore()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        style={{ position: 'relative', padding: 8, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
      >
        <Bell size={20} color="var(--charcoal)" />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: 10, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 320, background: 'white', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>Notifications</div>
          {notifications.length === 0 ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No notifications yet</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: 12, borderBottom: '1px solid var(--border)', background: n.read ? 'white' : 'var(--amber-pale)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px 0', color: 'var(--charcoal)' }}>{n.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 4px 0' }}>{n.body}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>
                  {new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.count);
  const { loginModalOpen, registerModalOpen, openLoginModal, openRegisterModal, closeModals } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/';
    const map = { customer: '/dashboard', shopkeeper: '/shop-dashboard', delivery: '/delivery-dashboard', admin: '/admin' };
    return map[user.role] || '/dashboard';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/stores', label: 'Stores' },
    ...(user ? [{ path: getDashboardPath(), label: 'Dashboard' }] : []),
    { path: '/shade-ai', label: '✨ Shade AI' },
  ];

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">Quick<span>Outfit</span></Link>

        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          {navLinks.map(({ path, label }) => (
            <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {isLoggedIn() ? (
            <>
              <NotificationBell />
              <Link to="/cart" className="cart-btn" title="Cart">
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>

              <div className="dropdown-wrapper" style={{ position: 'relative' }}>
                <button className="nav-link" onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--rust)' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>

                {showDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'white', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', padding: 8, minWidth: 200, zIndex: 100, animation: 'fadeIn 0.15s ease' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.email}</div>
                      <span className="badge badge-amber" style={{ marginTop: 4 }}>{user?.role}</span>
                    </div>
                    <button className="sidebar-item" onClick={() => { navigate(getDashboardPath()); setShowDropdown(false); }}>
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button className="sidebar-item" onClick={handleLogout} style={{ color: '#E53E3E' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn-nav-login" onClick={openLoginModal}>Log In</button>
              <button className="btn-nav-signup" onClick={openRegisterModal}>Sign Up</button>
            </>
          )}

          <button className="nav-link mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>✕</button>
            <LoginForm onSuccess={closeModals} onSwitchToRegister={openRegisterModal} />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {registerModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>✕</button>
            <RegisterForm onSuccess={closeModals} onSwitchToLogin={openLoginModal} />
          </div>
        </div>
      )}

      <style>{`
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(250,246,240,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 0 32px; height: 70px; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s; }
        .nav-logo { font-family: var(--font-display); font-size: 24px; font-weight: 900; color: var(--charcoal); letter-spacing: -0.5px; }
        .nav-logo span { color: var(--amber); }
        .nav-links { display: flex; gap: 8px; align-items: center; }
        .nav-link { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--text-secondary); cursor: pointer; border: none; background: none; transition: all 0.2s; text-decoration: none; }
        .nav-link:hover { color: var(--charcoal); background: var(--border); }
        .nav-link.active { color: var(--amber); }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .btn-nav-login { padding: 9px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; border: 1.5px solid var(--charcoal); background: none; color: var(--charcoal); cursor: pointer; transition: all 0.2s; }
        .btn-nav-login:hover { background: var(--charcoal); color: white; }
        .btn-nav-signup { padding: 9px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; background: var(--amber); color: white; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-nav-signup:hover { background: var(--rust); transform: translateY(-1px); }
        .cart-btn { position: relative; padding: 8px 14px; border-radius: 10px; background: var(--amber-pale); border: 1.5px solid var(--amber-light); cursor: pointer; font-size: 18px; transition: all 0.2s; display: flex; align-items: center; color: var(--rust); text-decoration: none; }
        .cart-btn:hover { background: var(--amber); color: white; }
        .cart-count { position: absolute; top: -6px; right: -6px; background: var(--rust); color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-links.mobile-open { display: flex; position: absolute; top: 70px; left: 0; right: 0; background: white; flex-direction: column; padding: 16px; border-bottom: 1px solid var(--border); }
          .mobile-menu-btn { display: flex !important; }
          .navbar { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
