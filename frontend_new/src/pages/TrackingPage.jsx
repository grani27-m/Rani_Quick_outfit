import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ordersAPI } from '../api/orders.api';
import { ORDER_STATUSES } from '../data/constants';
import { Package, Truck, Check, MapPin, Phone, Clock } from 'lucide-react';

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(orderId).then(({ data }) => { setOrder(data); setLoading(false); }).catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!order) return <div className="loading-page"><p>Order not found</p></div>;

  const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: '#666', icon: '📦' };
  const statuses = ['placed', 'confirmed', 'packed', 'picked', 'out-for-delivery', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 className="section-heading" style={{ marginBottom: 8 }}>Track Order</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>Order #{order._id?.slice(-8).toUpperCase()}</p>

        {/* Status */}
        <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 24, background: `linear-gradient(135deg, ${statusConfig.color}15, white)` }}>
          <span style={{ fontSize: 48 }}>{statusConfig.icon}</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12, color: statusConfig.color }}>{statusConfig.label}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            {order.status === 'delivered' ? 'Your order has been delivered!' : 'Your order is being processed'}
          </p>
        </div>

        {/* Timeline */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Timeline</h3>
          <div style={{ position: 'relative', paddingLeft: 30 }}>
            {statuses.map((status, i) => {
              const isCompleted = i <= currentIdx;
              const isCurrent = i === currentIdx;
              const timelineEntry = order.timeline?.find((t) => t.status === status);
              return (
                <div key={status} style={{ display: 'flex', gap: 16, marginBottom: i < statuses.length - 1 ? 24 : 0, position: 'relative' }}>
                  {/* Line */}
                  {i < statuses.length - 1 && (
                    <div style={{ position: 'absolute', left: -20, top: 20, width: 2, height: 'calc(100% + 4px)', background: isCompleted ? 'var(--amber)' : 'var(--border)' }} />
                  )}
                  {/* Dot */}
                  <div style={{ position: 'absolute', left: -25, top: 2, width: 12, height: 12, borderRadius: '50%', background: isCompleted ? 'var(--amber)' : 'var(--border)', border: isCurrent ? '3px solid var(--amber-light)' : 'none', zIndex: 1 }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: isCompleted ? 'var(--charcoal)' : 'var(--text-muted)' }}>
                      {ORDER_STATUSES[status]?.label || status}
                    </p>
                    {timelineEntry && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(timelineEntry.timestamp).toLocaleString()} {timelineEntry.note && `— ${timelineEntry.note}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Order Details</h3>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{item.name} × {item.qty} {item.size && `(${item.size})`}</span>
              <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 800, fontSize: 18 }}>
            <span>Total</span>
            <span style={{ color: 'var(--amber)' }}>₹{order.totalAmount?.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--cream)', borderRadius: 10 }}>
            <p style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {order.deliveryAddress?.address || 'Address not available'}</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Payment: {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
