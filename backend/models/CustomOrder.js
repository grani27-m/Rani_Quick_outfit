import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  measurements: {
    chest: Number,
    waist: Number,
    hip: Number,
    height: Number,
    weight: Number,
    shoulderWidth: Number,
    armLength: Number
  },
  garmentType: { type: String, required: true },
  fabricPreference: { type: String, default: '' },
  referenceImages: [String],
  budget: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  quotedPrice: Number,
  shopkeeperNote: { type: String, default: '' },
  deliveryDate: Date,
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

customOrderSchema.index({ customerId: 1, status: 1 });
customOrderSchema.index({ shopId: 1, status: 1 });

export default mongoose.model('CustomOrder', customOrderSchema);
