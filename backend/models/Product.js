import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [String],
  emoji: { type: String, default: '👗' },
  category: { type: String, enum: ['saree', 'kurta', 'western', 'ethnic', 'casual', 'formal', 'kids', 'mens', 'accessories'], default: 'kurta' },
  colours: [String],
  sizes: [String],
  fabricType: { type: String, enum: ['cotton', 'silk', 'synthetic', 'handloom', 'linen', 'chiffon', 'georgette', 'other'], default: 'cotton' },
  ecoScore: { type: Number, default: 70, min: 0, max: 100 },
  toneCompatibility: {
    fair: { type: Number, default: 80 },
    light: { type: Number, default: 80 },
    medium: { type: Number, default: 80 },
    wheatish: { type: Number, default: 80 },
    dusky: { type: Number, default: 80 },
    dark: { type: Number, default: 80 }
  },
  stock: { type: Number, default: 20 },
  rating: { type: Number, default: 4.0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  tags: [String],
  blockchainTokenId: String,
  isSeeded: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
