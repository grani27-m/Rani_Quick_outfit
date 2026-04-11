import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/tone
router.patch('/tone', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { skinTone: req.body.skinTone }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/measurements
router.patch('/measurements', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { measurements: req.body.measurements }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTE: Wishlist is now managed via /api/wishlist route to use Wishlist model
// See wishlist.js for wishlist endpoints

// POST /api/users/addresses — add new delivery address
router.post('/addresses', protect, async (req, res) => {
  try {
    const { label, address, lat, lng } = req.body;
    const user = await User.findById(req.user._id);
    user.savedAddresses.push({ label, address, lat, lng });
    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/addresses — list all saved addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/addresses/:addressId — update address
router.patch('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.savedAddresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    Object.assign(addr, req.body);
    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/users/addresses/:addressId — delete address
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses.id(req.params.addressId).deleteOne();
    await user.save();
    res.json({ message: 'Address deleted', addresses: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/password — change password
router.patch('/password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/loyalty
router.get('/loyalty', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ loyaltyPoints: user.loyaltyPoints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/loyalty/redeem
router.post('/loyalty/redeem', protect, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);
    if (user.loyaltyPoints < points) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }
    user.loyaltyPoints -= points;
    await user.save();
    res.json({ message: 'Points redeemed', loyaltyPoints: user.loyaltyPoints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
