import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  subcategories: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
