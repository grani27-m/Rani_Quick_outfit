import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders — create new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shopId, deliveryAddress, paymentMethod, subtotal, deliveryFee, discount, totalAmount, couponCode } = req.body;
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    const order = await Order.create({
      customerId: req.user._id,
      shopId,
      items,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      deliveryFee: deliveryFee || 30,
      discount: discount || 0,
      totalAmount,
      couponCode,
      deliveryOTP: otp,
      isPaid: paymentMethod !== 'cod',
      timeline: [{ status: 'placed', timestamp: new Date(), note: 'Order placed successfully' }]
    });

    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders — get orders for current user
router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'customer') {
      query = { customerId: req.user._id };
    } else if (req.user.role === 'shopkeeper') {
      query = { shopId: req.query.shopId };
    } else if (req.user.role === 'delivery') {
      query = { deliveryPartnerId: req.user._id };
    } else {
      query = {};
    }

    if (req.query.status) query.status = req.query.status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name address')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name address phone')
      .populate('deliveryPartnerId', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.timeline.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` });

    if (req.body.deliveryPartnerId) order.deliveryPartnerId = req.body.deliveryPartnerId;

    await order.save();

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${order._id}`).emit('orderUpdate', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/verify-otp — delivery confirms
router.post('/:id/verify-otp', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.otp !== order.deliveryOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    order.status = 'delivered';
    order.isPaid = true;
    order.timeline.push({ status: 'delivered', timestamp: new Date(), note: 'Delivered and verified with OTP' });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/cancel — cancel order
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel ${order.status} order` });
    }
    
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Customer cancelled';
    order.timeline.push({ status: 'cancelled', timestamp: new Date(), note: order.cancellationReason });
    await order.save();
    
    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${order._id}`).emit('orderCancelled', order);
    }
    
    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id/tracking — real-time tracking
router.get('/:id/tracking', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('deliveryPartnerId', 'name phone')
      .populate('shopId', 'name');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json({
      orderId: order._id,
      status: order.status,
      timeline: order.timeline,
      shop: order.shopId,
      deliveryPartner: order.deliveryPartnerId,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      currentLocation: { lat: 28.6139, lng: 77.2090 } // Mock location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/return — initiate return/RMA
router.post('/:id/return', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only return delivered orders' });
    }
    
    // Create return status
    order.returnRequested = true;
    order.returnReason = req.body.reason;
    order.timeline.push({ 
      status: 'return-requested', 
      timestamp: new Date(), 
      note: `Return requested: ${req.body.reason}` 
    });
    await order.save();
    
    res.json({ message: 'Return request submitted', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/assign-delivery — assign delivery partner
router.patch('/:id/assign-delivery', protect, authorize('shopkeeper', 'admin'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPartnerId: req.body.deliveryPartnerId },
      { new: true }
    ).populate('deliveryPartnerId', 'name phone');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.timeline.push({ 
      status: 'assigned', 
      timestamp: new Date(), 
      note: 'Delivery partner assigned'
    });
    await order.save();
    
    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${order._id}`).emit('deliveryAssigned', order);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
