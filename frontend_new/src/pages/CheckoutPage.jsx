import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/orders.api';
import { cartAPI } from '../api/cart.api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { MapPin, CreditCard, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [cartData, setCartData] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ label: 'Home', address: '', lat: 28.6139, lng: 77.2090 });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    cartAPI.get().then(({ data }) => { setCartData(data); setLoading(false); }).catch(() => setLoading(false));
    if (user?.savedAddresses?.length > 0) setAddress(user.savedAddresses[0]);
  }, []);

  const subtotal = cartData.subtotal || 0;
  const deliveryFee = subtotal > 999 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.address) return toast.error('Please enter delivery address');
    setPlacing(true);
    try {
      const items = cartData.items.map((item) => ({
        productId: item.productId._id || item.productId,
        name: item.productId.name,
        price: item.productId.price,
        qty: item.quantity,
        size: item.size,
        colour: item.color,
      }));

      const shopId = cartData.items[0]?.productId?.shopId?._id || cartData.items[0]?.productId?.shopId;

      const { data } = await ordersAPI.create({
        items,
        shopId,
        deliveryAddress: address,
        paymentMethod,
        subtotal,
        deliveryFee,
        discount: 0,
        totalAmount: total,
      });

      await cartAPI.clear();
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/track/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 className="section-heading" style={{ marginBottom: 32 }}>Checkout</h1>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {['Address', 'Payment', 'Review'].map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: step > i + 1 ? 'var(--sage)' : step === i + 1 ? 'var(--amber)' : 'var(--border)', color: step >= i + 1 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700, fontSize: 14, transition: 'all 0.3s' }}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step === i + 1 ? 'var(--charcoal)' : 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={20} /> Delivery Address</h2>
            <div className="form-group">
              <label className="form-label">Label</label>
              <select className="form-select" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea className="form-textarea" placeholder="Enter your complete delivery address..." value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={() => address.address ? setStep(2) : toast.error('Enter address')} style={{ marginLeft: 'auto', display: 'flex' }}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={20} /> Payment Method</h2>
            {[
              { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
              { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
              { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
            ].map((pm) => (
              <label key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, border: paymentMethod === pm.id ? '2px solid var(--amber)' : '2px solid var(--border)', marginBottom: 12, cursor: 'pointer', background: paymentMethod === pm.id ? 'var(--amber-pale)' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} style={{ accentColor: 'var(--amber)' }} />
                <span style={{ fontSize: 24 }}>{pm.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{pm.label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pm.desc}</p>
                </div>
              </label>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📦 Items ({cartData.items?.length})</h3>
              {cartData.items?.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span>{item.productId?.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.productId?.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <p style={{ fontSize: 14 }}><strong>📍 Delivery:</strong> {address.address}</p>
              <p style={{ fontSize: 14, marginTop: 8 }}><strong>💳 Payment:</strong> {paymentMethod.toUpperCase()}</p>
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, borderTop: '1px solid var(--border)', paddingTop: 12 }}><span>Total</span><span style={{ color: 'var(--amber)' }}>₹{total.toLocaleString()}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
