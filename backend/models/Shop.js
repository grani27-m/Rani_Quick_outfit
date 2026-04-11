import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['saree', 'kurta', 'western', 'ethnic', 'kids', 'mens', 'accessories', 'general'], default: 'general' },
  image: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.209, 28.6139] } // [lng, lat] default Delhi
  },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  sizeCharts: {
    S: { chest: Number, waist: Number, length: Number },
    M: { chest: Number, waist: Number, length: Number },
    L: { chest: Number, waist: Number, length: Number },
    XL: { chest: Number, waist: Number, length: Number },
    XXL: { chest: Number, waist: Number, length: Number }
  },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending' },
  rejectionReason: String,
  suspensionReason: String,
  documents: [{
    type: String, // shop_license, tax_id, bank_account, etc.
    url: String,
    uploadedAt: Date,
    verified: { type: Boolean, default: false }
  }],
  businessType: { type: String, enum: ['individual', 'partnership', 'pvt-ltd'], default: 'individual' },
  acceptedPaymentMethods: { type: [String], default: ['upi', 'cod'] },
  monthlyRevenue: { type: Number, default: 0 },
  operatingHours: {
    open: { type: String, default: '10:00' },
    close: { type: String, default: '21:00' }
  },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

shopSchema.index({ location: '2dsphere' });

export default mongoose.model('Shop', shopSchema);
