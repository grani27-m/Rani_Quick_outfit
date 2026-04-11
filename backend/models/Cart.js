import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
