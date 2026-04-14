import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/cart.api';
import useCartStore from '../store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, setItems, setLoading } = useCartStore();
  const [cartData, setCartData] = useState({ items: [], subtotal: 0 });
  const [loading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get();
      setCartData(data);
      setItems(data.items || []);
    } catch {}
    setPageLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQty = async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, { quantity });
      fetchCart();
    } catch { toast.error('Failed to update'); }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      fetchCart();
      toast.success('Item removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleClear = async () => {
    try {
      await cartAPI.clear();
      setCartData({ items: [], subtotal: 0 });
      setItems([]);
      toast.success('Cart cleared');
    } catch {}
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const cartItems = cartData.items || [];
  const subtotal = cartData.subtotal || 0;
  const deliveryFee = subtotal > 999 ? 0 : 30;
  const total = subtotal + deliveryFee;

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-heading" style={{ marginBottom: 32 }}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Browse products and add items to your cart</p>
            <Link to="/browse" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map((item) => {
                const product = item.productId;
                if (!product) return null;
                return (
                  <div key={item._id} className="card" style={{ display: 'flex', gap: 16, padding: 16 }}>
                    <div style={{ width: 100, height: 120, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40 }}>{product.emoji || '👗'}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{product.name}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginBottom: 8 }}>₹{product.price?.toLocaleString()}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}><Plus size={14} /></button>
                        <button onClick={() => handleRemove(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', marginLeft: 'auto' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={handleClear} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>Clear Cart</button>
            </div>

            {/* Summary */}
            <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>Subtotal</span><span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>Delivery</span><span style={{ fontWeight: 600, color: deliveryFee === 0 ? 'var(--sage)' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}><span>Total</span><span style={{ color: 'var(--amber)' }}>₹{total.toLocaleString()}</span></div>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              {subtotal < 999 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>Add ₹{999 - subtotal} more for free delivery</p>}
            </div>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
