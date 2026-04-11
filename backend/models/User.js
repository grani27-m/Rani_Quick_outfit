import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'shopkeeper', 'delivery', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  skinTone: { type: String, enum: ['', 'fair', 'light', 'medium', 'wheatish', 'dusky', 'dark'], default: '' },
  measurements: {
    height: Number,
    weight: Number,
    chest: Number,
    waist: Number,
    hip: Number,
    bodyType: { type: String, enum: ['', 'slim', 'regular', 'athletic', 'plus'], default: '' }
  },
  savedAddresses: [{
    label: String,
    address: String,
    lat: Number,
    lng: Number
  }],
  loyaltyPoints: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  fcmToken: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
