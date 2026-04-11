import express from 'express';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, shopName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, phone, password, role: role || 'customer' });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      skinTone: user.skinTone,
      measurements: user.measurements,
      loyaltyPoints: user.loyaltyPoints,
      savedAddresses: user.savedAddresses,
      wishlist: user.wishlist,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is registered as ${user.role}` });
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      skinTone: user.skinTone,
      measurements: user.measurements,
      loyaltyPoints: user.loyaltyPoints,
      savedAddresses: user.savedAddresses,
      wishlist: user.wishlist,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// POST /api/auth/verify-otp (demo — always accepts 123456)
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (otp === '123456') {
    res.json({ verified: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ verified: false, message: 'Invalid OTP' });
  }
});

export default router;
