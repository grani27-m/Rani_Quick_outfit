import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--charcoal)', color: 'white', padding: '64px 32px 32px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>Quick<span style={{ color: 'var(--amber)' }}>Outfit</span></h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7 }}>Hyperlocal fashion marketplace connecting you with nearby boutiques and artisans. AI-powered style recommendations.</p>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--amber)' }}>Shop</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/browse" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, transition: 'color 0.2s' }}>Browse All</Link>
            <Link to="/stores" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Find Stores</Link>
            <Link to="/shade-ai" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Shade AI</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--amber)' }}>For Sellers</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/shop-dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Seller Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Register Your Shop</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Pricing</span>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--amber)' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> support@quickoutfit.com</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +91 98765 43210</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> Delhi, India</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 48, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>© 2025 QuickOutfit. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}><Globe size={18} /></a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)' }}><MessageCircle size={18} /></a>
        </div>
      </div>
    </footer>
  );
}
