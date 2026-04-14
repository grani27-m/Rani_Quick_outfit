import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products.api';
import ProductCard from '../components/common/ProductCard';
import { CATEGORIES, SKIN_TONES } from '../data/constants';
import { ArrowRight, Sparkles, MapPin, Truck, Shield, Star } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getFeatured().then(({ data }) => { setFeatured(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--amber-pale) 50%, var(--warm-white) 100%)', padding: '120px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div style={{ animation: 'slideUp 0.6s ease forwards' }}>
            <span className="badge badge-amber" style={{ marginBottom: 16, fontSize: 13 }}>✨ AI-Powered Fashion</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginBottom: 20, color: 'var(--charcoal)' }}>
              Local Fashion,<br /><span style={{ color: 'var(--amber)' }}>Fast Delivery</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Discover handpicked fashion from boutiques near you. Get AI-powered color recommendations based on your skin tone.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/browse" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/shade-ai" className="btn btn-outline btn-lg">
                <Sparkles size={18} /> Try Shade AI
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              <div><span style={{ fontSize: 28, fontWeight: 800, color: 'var(--charcoal)' }}>500+</span><br /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Local Shops</span></div>
              <div><span style={{ fontSize: 28, fontWeight: 800, color: 'var(--charcoal)' }}>10k+</span><br /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Products</span></div>
              <div><span style={{ fontSize: 28, fontWeight: 800, color: 'var(--charcoal)' }}>2hr</span><br /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Delivery</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'slideUp 0.8s ease forwards' }}>
            <div style={{ width: 380, height: 460, borderRadius: 24, background: 'linear-gradient(135deg, var(--amber) 0%, var(--rust) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, boxShadow: '0 30px 80px rgba(232,135,42,0.3)', transform: 'rotate(-3deg)' }}>
              👗
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">Shop by Category</h2>
            <p className="section-sub">Find exactly what you're looking for</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => navigate(`/browse?category=${cat.id}`)} 
                className="category-card"
              >
                <img src={cat.image} alt={cat.name} className="category-img" loading="lazy" />
                <div className="category-overlay"></div>
                <div className="category-text">
                  <span>{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="section-sub">Hand-picked styles from top local boutiques</p>
            </div>
            <Link to="/browse" className="btn btn-ghost">View All <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="loading-page"><div className="spinner"></div></div>
          ) : (
            <div className="products-grid">
              {featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
              {featured.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>No products yet. Run the seed script to populate!</p>}
            </div>
          )}
        </div>
      </section>

      {/* Shade AI Highlight */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #2D2D30 100%)', color: 'white' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(232,135,42,0.2)', color: 'var(--amber)', marginBottom: 16 }}>✨ AI Feature</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
              Shade AI — Find Your <span style={{ color: 'var(--amber)' }}>Perfect Colors</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32 }}>
              Upload a selfie or pick your skin tone. Our AI recommends colors that make you shine.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              {Object.entries(SKIN_TONES).map(([key, val]) => (
                <div key={key} style={{ width: 48, height: 48, borderRadius: 12, background: val.color, border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} title={val.label} />
              ))}
            </div>
            <Link to="/shade-ai" className="btn btn-primary btn-lg">
              <Sparkles size={18} /> Try Shade AI
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 300, height: 360, borderRadius: 24, background: 'linear-gradient(135deg, var(--amber) 0%, #FF6B6B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, boxShadow: '0 30px 80px rgba(232,135,42,0.3)' }}>
              🎨
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2 className="section-heading">How QuickOutfit Works</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>From discovery to doorstep in 3 simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32, marginTop: 48 }}>
            {[
              { icon: <MapPin size={28} />, title: 'Discover Nearby', desc: 'Find boutiques and products available near your location' },
              { icon: <Sparkles size={28} />, title: 'AI Recommendations', desc: 'Get personalized color and style suggestions based on your profile' },
              { icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Hyperlocal delivery within 2 hours from nearby shops' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--amber)' }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section .container[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          section h1 { font-size: 36px !important; }
        }
        .category-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 3/4;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .category-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover .category-img {
          transform: scale(1.08);
        }
        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0.8;
        }
        .category-card:hover .category-overlay {
          opacity: 1;
        }
        .category-text {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          text-align: center;
          pointer-events: none;
        }
        .category-text span {
          color: white;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

      `}</style>
    </div>
  );
}
