import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    size: String,
    colour: String
  }],
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'picked', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  deliveryOTP: { type: String },
  deliveryAddress: {
    label: String,
    address: String,
    lat: Number,
    lng: Number
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 30 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  couponCode: String,
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod', 'wallet'], default: 'cod' },
  paymentId: String,
  isPaid: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  cancellationReason: String,
  returnRequested: { type: Boolean, default: false },
  returnReason: String,
  returnApproved: { type: Boolean, default: false },
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  review: {
    rating: Number,
    comment: String,
    createdAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
