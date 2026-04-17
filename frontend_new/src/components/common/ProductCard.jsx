import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Leaf } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import { cartAPI } from '../../api/cart.api';
import { wishlistAPI } from '../../api/wishlist.api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { has, toggle } = useWishlistStore();

  const isWished = has(product._id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const shopName = product.shopId?.name || 'Local Shop';

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) return toast.error('Please login first');
    try {
      await cartAPI.add({ productId: product._id, quantity: 1, size: product.sizes?.[0] || '', color: product.colours?.[0] || '' });
      addItem({ productId: product._id, price: product.price, quantity: 1 });
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) return toast.error('Please login first');
    try {
      if (isWished) { await wishlistAPI.remove(product._id); } else { await wishlistAPI.add(product._id); }
      toggle(product._id);
    } catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <div className="card product-card" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 64 }}>{product.emoji || '👗'}</span>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {discount > 0 && <span className="badge badge-red">{discount}% OFF</span>}
          {product.ecoScore >= 80 && <span className="badge badge-green"><Leaf size={10} /> Eco</span>}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}>
          <Heart size={16} fill={isWished ? '#E53E3E' : 'none'} color={isWished ? '#E53E3E' : 'var(--text-muted)'} />
        </button>

        {product.outOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#ef4444', color: 'white', fontWeight: 700, padding: '8px 16px', borderRadius: 999, fontSize: 14 }}>
              OUT OF STOCK
            </span>
          </div>
        )}

        {product.lowStock && !product.outOfStock && (
          <div style={{ position: 'absolute', top: 10, left: discount > 0 ? 85 : 10, zIndex: 10 }}>
            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, padding: '4px 8px', borderRadius: 999, fontWeight: 600 }}>
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Quick add */}
        <button 
          onClick={(e) => !product.outOfStock && handleAddToCart(e)} 
          disabled={product.outOfStock}
          style={{ position: 'absolute', bottom: 10, right: 10, padding: '8px 14px', borderRadius: 8, background: product.outOfStock ? '#e5e7eb' : 'var(--amber)', color: product.outOfStock ? '#9ca3af' : 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: product.outOfStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: product.outOfStock ? 1 : 0, transition: 'opacity 0.3s' }} 
          className="quick-add"
        >
          {product.outOfStock ? 'Out of Stock' : <><ShoppingBag size={14} /> Add</>}
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{shopName}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 8 }}>₹{product.originalPrice?.toLocaleString()}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} fill="var(--amber)" color="var(--amber)" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{product.rating?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <style>{`
        .product-card:hover .quick-add { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
