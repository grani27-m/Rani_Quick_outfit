import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

let razorpay;
// Only initialize Razorpay if keys are available
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/create-order — create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay keys not configured in backend.' });
    }
    
    // amount should be in rupees from the client
    const { amount, receipt } = req.body;
    
    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/verify — verify payment and update local DB
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;

    // Validate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find and update our internal Order document
      if (internal_order_id) {
         const order = await Order.findByIdAndUpdate(
           internal_order_id,
           {
             isPaid: true,
             paymentStatus: 'completed',
             paymentId: razorpay_payment_id
           },
           { new: true }
         );
         
         return res.json({ verified: true, message: 'Payment verified and order updated.', order });
      } else {
         return res.json({ verified: true, message: 'Payment verified successfully.' });
      }
    } else {
      res.status(400).json({ verified: false, message: 'Invalid payment signature!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/callback — Razorpay webhook callback
router.post('/callback', async (req, res) => {
  try {
    const { payload } = req.body;
    
    if (payload.payment.entity.status === 'captured') {
      const order = await Order.findOne({ paymentId: payload.payment.entity.id });
      if (order) {
        order.isPaid = true;
        order.paymentStatus = 'completed';
        await order.save();
      }
    }
    
    res.json({ acknowledged: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/:orderId — get payment status
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json({
      orderId: order._id,
      isPaid: order.isPaid,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
