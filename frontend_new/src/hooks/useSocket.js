import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import toast from 'react-hot-toast'

let socketInstance = null

export function useSocket() {
  const { token, user } = useAuthStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!token || !user) return

    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
    })

    // ── CUSTOMER EVENTS ──────────────────────────────────────
    socketInstance.on('orderConfirmation', (data) => {
      toast.success(data.message, { duration: 5000 })
      addNotification({ type: 'order', title: 'Order Placed!', body: data.message, data })
    })

    socketInstance.on('orderStatusUpdate', (data) => {
      toast(data.message, { 
        icon: data.status === 'delivered' ? '🎉' : data.status === 'cancelled' ? '❌' : '📦',
        duration: 6000 
      })
      addNotification({ type: 'order_update', title: `Order ${data.status}`, body: data.message, data })
    })

    // ── SHOPKEEPER EVENTS ────────────────────────────────────
    socketInstance.on('newOrder', (data) => {
      toast.success(`New order #${data.orderRef} from ${data.customerName}!`, { duration: 8000 })
      addNotification({ 
        type: 'new_order', 
        title: `New Order #${data.orderRef}`,
        body: `${data.customerName} ordered ₹${data.totalAmount}`, 
        data 
      })
    })

    socketInstance.on('orderPickedUp', (data) => {
      toast(data.message, { icon: '🚴', duration: 5000 })
      addNotification({ type: 'order_picked', title: 'Order Picked Up', body: data.message, data })
    })

    // ── DELIVERY EVENTS ──────────────────────────────────────
    socketInstance.on('newDeliveryAvailable', (data) => {
      toast(`New delivery: #${data.orderRef} — Earn ₹${data.estimatedEarning}`, {
        icon: '📦', duration: 10000
      })
      addNotification({ 
        type: 'delivery_available', 
        title: `Delivery Available — ₹${data.estimatedEarning}`,
        body: `From ${data.shopName}`, 
        data 
      })
    })

    return () => {
      socketInstance?.disconnect()
      socketInstance = null
    }
  }, [token, user])

  return socketInstance
}

export function getSocket() { return socketInstance }
