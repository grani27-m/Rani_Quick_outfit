import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products.api';
import { cartAPI } from '../api/cart.api';
import { reviewsAPI } from '../api/reviews.api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/common/ProductCard';
import { ShoppingBag, Heart, Share2, Leaf, Truck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsAPI.getById(id),
      productsAPI.getRelated(id).catch(() => ({ data: [] })),
      reviewsAPI.getByProduct(id).catch(() => ({ data: { reviews: [] } })),
    ]).then(([prodRes, relRes, revRes]) => {
      setProduct(prodRes.data);
      setRelated(relRes.data || []);
      setReviews(revRes.data?.reviews || []);
      setSelectedSize(prodRes.data?.sizes?.[0] || '');
      setSelectedColor(prodRes.data?.colours?.[0] || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) return toast.error('Please login first');
    try {
      await cartAPI.add({ productId: product._id, quantity: qty, size: selectedSize, color: selectedColor });
      addItem({ productId: product._id, price: product.price, quantity: qty });
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add'); }
  };

  if (loading) return <div className="loading-page" style={{ paddingTop: 100 }}><div className="spinner"></div></div>;
  if (!product) return <div className="loading-page" style={{ paddingTop: 100 }}><p>Product not found</p></div>;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="section">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ aspectRatio: '3/4', borderRadius: 16, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
              {product.images?.length > 0 ? (
                <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 120 }}>{product.emoji || '👗'}</span>
              )}
              {product.images?.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><ChevronLeft size={18} /></button>
                  <button onClick={() => setActiveImage((activeImage + 1) % product.images.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><ChevronRight size={18} /></button>
                </>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImage(i)} style={{ width: 64, height: 80, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: i === activeImage ? '2px solid var(--amber)' : '2px solid var(--border)', flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-amber">{product.category}</span>
              {product.ecoScore >= 80 && <span className="badge badge-green"><Leaf size={10} /> Eco Score: {product.ecoScore}</span>}
              {product.isFeatured && <span className="badge badge-blue">Featured</span>}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{product.name}</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>by {product.shopId?.name || 'Local Shop'}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <StarRating rating={product.rating} />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--amber)' }}>₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="badge badge-red">{discount}% OFF</span>
                </>
              )}
            </div>

            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Size</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button key={size} className={`btn btn-sm ${selectedSize === size ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedSize(size)}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colours?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colours.map((color) => (
                    <button key={color} className={`btn btn-sm ${selectedColor === color ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedColor(color)}>{color}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, width: 40, textAlign: 'center' }}>{qty}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setQty(qty + 1)}>+</button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.stock} in stock</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1, justifyContent: 'center' }}>
                <ShoppingBag size={18} /> Add to Cart — ₹{(product.price * qty).toLocaleString()}
              </button>
              <button className="btn btn-ghost btn-lg"><Heart size={18} /></button>
              <button className="btn btn-ghost btn-lg"><Share2 size={18} /></button>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 13 }}><Truck size={16} color="var(--sage)" /> Free delivery over ₹999</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'var(--cream)', borderRadius: 10, fontSize: 13 }}><Shield size={16} color="var(--sky)" /> Easy returns</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {reviews.map((r) => (
                <div key={r._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{r.userId?.name?.[0] || 'U'}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{r.userId?.name || 'User'}</p>
                        {r.isVerifiedPurchase && <span className="badge badge-green" style={{ fontSize: 10 }}>Verified Purchase</span>}
                      </div>
                    </div>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No reviews yet</p>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Related Products</h2>
            <div className="products-grid">
              {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 768px) { .container > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
