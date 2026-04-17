import express from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Shop from '../models/Shop.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// ── PLACE ORDER ─────────────────────────────────────────────
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body
    
    // 1. Validate all items and extract shopId from products (NEVER from frontend)
    let shopId = null
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} not found or inactive` })
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Only ${product.stock} units of "${product.name}" available` 
        })
      }
      if (!shopId) shopId = product.shopId
      subtotal += product.price * item.qty
      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        size: item.size,
        color: item.color,
        image: product.images[0]
      })
    }

    const deliveryFee = subtotal >= 999 ? 0 : 49
    const totalAmount = subtotal + deliveryFee
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString()
    
    // 2. Create order
    const order = await Order.create({
      customerId: req.user._id,
      shopId,
      items: validatedItems,
      deliveryAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryOTP,
      status: 'placed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      timeline: [{ status: 'placed', timestamp: new Date(), note: 'Order placed by customer' }]
    })

    // 3. Reduce stock for all items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } })
    }

    // 4. Populate order for socket emit
    const populated = await Order.findById(order._id)
      .populate('customerId', 'name phone email')
      .populate('shopId', 'name ownerId')

    // 5. Emit Socket.io to shopkeeper — real-time notification
    const io = req.app.get('io')
    const shopOwner = populated.shopId.ownerId.toString()
    io.to(`user:${shopOwner}`).emit('newOrder', {
      orderId: order._id,
      orderRef: order._id.toString().slice(-8).toUpperCase(),
      customerName: populated.customerId.name,
      customerPhone: populated.customerId.phone,
      items: validatedItems,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      status: 'placed',
      timestamp: new Date().toISOString()
    })

    // 6. Real-time notification to customer (confirmation)
    io.to(`user:${req.user._id}`).emit('orderConfirmation', {
      orderId: order._id,
      message: `Order placed! Waiting for shop to confirm.`,
      status: 'placed',
      deliveryOTP,
      totalAmount
    })

    res.status(201).json({ success: true, order: populated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── UPDATE ORDER STATUS (shopkeeper / delivery / admin) ─────
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name')
      .populate('shopId', 'name ownerId')
    
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const io = req.app.get('io')
    const validTransitions = {
      shopkeeper: {
        placed:    ['confirmed', 'cancelled'],
        confirmed: ['packed', 'cancelled'],
        packed:    ['ready_to_dispatch']
      },
      delivery: {
        ready_to_dispatch: ['picked'],
        picked:            ['delivering'],
        delivering:        ['delivered']
      },
      admin: ['cancelled', 'returned']
    }

    const allowedForRole = validTransitions[req.user.role]
    if (allowedForRole && !Array.isArray(allowedForRole)) {
      const currentAllowed = allowedForRole[order.status]
      if (!currentAllowed || !currentAllowed.includes(status)) {
        return res.status(400).json({ 
          message: `Cannot change status from ${order.status} to ${status}` 
        })
      }
    }

    order.status = status
    order.timeline.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` })
    await order.save()

    // Real-time notification to CUSTOMER on every status change
    const messages = {
      confirmed:          '✅ Your order has been confirmed by the shop!',
      packed:             '📦 Your order is packed and ready.',
      ready_to_dispatch:  '🚀 Your order is ready to dispatch!',
      picked:             '🚴 Delivery partner has picked up your order.',
      delivering:         '📍 Your order is out for delivery!',
      delivered:          '🎉 Order delivered! Enjoy your purchase.',
      cancelled:          '❌ Your order has been cancelled.'
    }

    io.to(`user:${order.customerId._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status,
      message: messages[status] || `Order status: ${status}`,
      timestamp: new Date().toISOString()
    })

    // Notify delivery partners when ready_to_dispatch
    if (status === 'ready_to_dispatch') {
      io.to('delivery:available').emit('newDeliveryAvailable', {
        orderId: order._id,
        orderRef: order._id.toString().slice(-8).toUpperCase(),
        shopName: order.shopId.name,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        estimatedEarning: Math.max(30, Math.floor(order.totalAmount * 0.05))
      })
    }

    // Notify shopkeeper when delivery picks up
    if (status === 'picked') {
      io.to(`user:${order.shopId.ownerId}`).emit('orderPickedUp', {
        orderId: order._id,
        message: 'Order has been picked up by delivery partner.'
      })
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── VERIFY DELIVERY OTP ──────────────────────────────────────
router.post('/:id/verify-otp', protect, authorize('delivery'), async (req, res) => {
  try {
    const { otp } = req.body
    const order = await Order.findById(req.params.id).populate('customerId', 'name')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.deliveryOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' })

    order.status = 'delivered'
    order.paymentStatus = 'completed'
    order.timeline.push({ status: 'delivered', timestamp: new Date(), note: 'Delivery confirmed by OTP' })
    await order.save()

    const io = req.app.get('io')
    io.to(`user:${order.customerId._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: 'delivered',
      message: '🎉 Order delivered! Thank you for shopping with QuickOutfit.',
    })

    res.json({ success: true, message: 'Order marked as delivered' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET ORDERS ───────────────────────────────────────────────
router.get('/my', protect, authorize('customer'), async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id })
    .populate('shopId', 'name').sort({ createdAt: -1 })
  res.json(orders)
})

router.get('/shop', protect, authorize('shopkeeper'), async (req, res) => {
  const shop = await Shop.findOne({ ownerId: req.user._id })
  if (!shop) return res.json([])
  const orders = await Order.find({ shopId: shop._id })
    .populate('customerId', 'name phone email').sort({ createdAt: -1 })
  res.json(orders)
})

router.get('/delivery/available', protect, authorize('delivery'), async (req, res) => {
  const orders = await Order.find({ status: 'ready_to_dispatch', deliveryPartnerId: null })
    .populate('shopId', 'name address').populate('customerId', 'name phone')
  res.json(orders)
})

router.post('/:id/accept-delivery', protect, authorize('delivery'), async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    deliveryPartnerId: req.user._id,
    status: 'picked',
    $push: { timeline: { status: 'picked', timestamp: new Date(), note: 'Accepted by delivery partner' } }
  }, { new: true }).populate('customerId', 'name phone').populate('shopId', 'name address')

  const io = req.app.get('io')
  io.to(`user:${order.customerId._id}`).emit('orderStatusUpdate', {
    orderId: order._id,
    status: 'picked',
    message: '🚴 Delivery partner has picked up your order and is on the way!'
  })

  res.json({ success: true, order })
})

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customerId', 'name phone email')
    .populate('shopId', 'name address phone')
    .populate('deliveryPartnerId', 'name phone')
  if (!order) return res.status(404).json({ message: 'Not found' })
  res.json(order)
})

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  const orders = await Order.find()
    .populate('customerId', 'name email')
    .populate('shopId', 'name')
    .populate('deliveryPartnerId', 'name')
    .sort({ createdAt: -1 })
  res.json(orders)
})

export default router
