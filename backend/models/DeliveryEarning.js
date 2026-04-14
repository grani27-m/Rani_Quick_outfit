import mongoose from 'mongoose';

const deliveryEarningSchema = new mongoose.Schema({
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  distance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  paidAt: Date,
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

deliveryEarningSchema.index({ deliveryPartnerId: 1, createdAt: -1 });

export default mongoose.model('DeliveryEarning', deliveryEarningSchema);
