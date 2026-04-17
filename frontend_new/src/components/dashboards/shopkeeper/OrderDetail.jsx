import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI } from '../../../api/orders.api'
import toast from 'react-hot-toast'

export default function ShopkeeperOrders() {
  const queryClient = useQueryClient()
  const { data: orders = [], isLoading } = useQuery(['shop-orders'], ordersAPI.getShopOrders)
  const [selected, setSelected] = useState(null)

  const updateStatus = useMutation(
    ({ orderId, status }) => ordersAPI.updateStatus(orderId, status),
    {
      onSuccess: (_, vars) => {
        toast.success(`Order marked as ${vars.status}`)
        queryClient.invalidateQueries(['shop-orders'])
        setSelected(null)
      }
    }
  )

  const STATUS_ACTIONS = {
    placed:    { next: 'confirmed',         label: '✅ Confirm Order',        color: 'bg-green-500' },
    confirmed: { next: 'packed',            label: '📦 Mark as Packed',       color: 'bg-blue-500' },
    packed:    { next: 'ready_to_dispatch', label: '🚀 Ready to Dispatch',    color: 'bg-orange-500' },
  }

  const STATUS_COLORS = {
    placed:             'bg-yellow-100 text-yellow-800',
    confirmed:          'bg-blue-100 text-blue-800',
    packed:             'bg-purple-100 text-purple-800',
    ready_to_dispatch:  'bg-orange-100 text-orange-800',
    picked:             'bg-indigo-100 text-indigo-800',
    delivering:         'bg-teal-100 text-teal-800',
    delivered:          'bg-green-100 text-green-800',
    cancelled:          'bg-red-100 text-red-800',
  }

  if (isLoading) return <div className="p-8 text-center">Loading orders...</div>

  if (selected) return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => setSelected(null)} className="mb-4 text-orange-600 flex items-center gap-1">
        ← Back to all orders
      </button>
      
      <div className="bg-white border rounded-2xl p-6 space-y-6">
        {/* Order Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Order #{selected._id.slice(-8).toUpperCase()}</h2>
            <p className="text-gray-500 text-sm">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selected.status]}`}>
            {selected.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Customer Info */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Customer Details</h3>
          <p><span className="text-gray-500">Name:</span> {selected.customerId?.name}</p>
          <p><span className="text-gray-500">Phone:</span> {selected.customerId?.phone}</p>
          <p><span className="text-gray-500">Email:</span> {selected.customerId?.email}</p>
        </div>

        {/* Items */}
        <div className="border rounded-xl p-4">
          <h3 className="font-medium mb-3">Order Items</h3>
          <div className="space-y-3">
            {selected.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                  </p>
                  <p className="text-orange-600 font-medium">₹{item.price} × {item.qty} = ₹{item.price * item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Delivery */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-xl p-4">
            <h3 className="font-medium mb-2">Payment</h3>
            <p><span className="text-gray-500">Method:</span> {selected.paymentMethod?.toUpperCase()}</p>
            <p><span className="text-gray-500">Status:</span> {selected.paymentStatus}</p>
            <p><span className="text-gray-500">Subtotal:</span> ₹{selected.subtotal}</p>
            <p><span className="text-gray-500">Delivery:</span> ₹{selected.deliveryFee}</p>
            <p className="font-semibold mt-1">Total: ₹{selected.totalAmount}</p>
          </div>
          <div className="border rounded-xl p-4">
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <p>{selected.deliveryAddress?.label}</p>
            <p className="text-gray-600 text-sm">{selected.deliveryAddress?.street}</p>
            <p className="text-gray-600 text-sm">{selected.deliveryAddress?.city} — {selected.deliveryAddress?.pincode}</p>
            <p className="text-gray-600 text-sm mt-1">📞 {selected.deliveryAddress?.phone}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="border rounded-xl p-4">
          <h3 className="font-medium mb-3">Order Timeline</h3>
          <div className="space-y-2">
            {selected.timeline?.map((t, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-orange-500 font-medium whitespace-nowrap">
                  {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-700">{t.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {STATUS_ACTIONS[selected.status] && (
          <button
            onClick={() => updateStatus.mutate({ orderId: selected._id, status: STATUS_ACTIONS[selected.status].next })}
            disabled={updateStatus.isLoading}
            className={`w-full py-3 rounded-xl text-white font-medium ${STATUS_ACTIONS[selected.status].color}`}
          >
            {updateStatus.isLoading ? 'Updating...' : STATUS_ACTIONS[selected.status].label}
          </button>
        )}

        {/* Cancel */}
        {['placed', 'confirmed'].includes(selected.status) && (
          <button
            onClick={() => updateStatus.mutate({ orderId: selected._id, status: 'cancelled', note: 'Cancelled by shopkeeper' })}
            className="w-full py-2 border border-red-300 text-red-600 rounded-xl"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders yet</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order._id}
              onClick={() => setSelected(order)}
              className="bg-white border rounded-2xl p-4 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">{order.customerId?.name} · {order.items?.length} item(s)</p>
                  <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">₹{order.totalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{order.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
