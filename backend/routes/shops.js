import express from 'express';
import Shop from '../models/Shop.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/shops — list all approved shops
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { approved: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const shops = await Shop.find(query).populate('ownerId', 'name email');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/:id
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops (shopkeeper creates)
router.post('/', protect, authorize('shopkeeper'), async (req, res) => {
  try {
    const shop = await Shop.create({ ...req.body, ownerId: req.user._id });
    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/shops/:id — SECURITY FIX: verify ownership or admin
router.patch('/:id', protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    
    // Only owner or admin can update
    if (shop.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: not shop owner' });
    }
    
    const updateData = { ...req.body };
    delete updateData.approved; // Only admin can approve
    delete updateData.verificationStatus;
    
    const updated = await Shop.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/nearby — list nearby approved shops (geospatial)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // default 5km (5000m)
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const shops = await Shop.find({
      approved: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/owner/mine (shopkeeper's own shops)
router.get('/owner/mine', protect, authorize('shopkeeper'), async (req, res) => {
  try {
    const shops = await Shop.find({ ownerId: req.user._id });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops/:id/approve (admin only) — approve shop application
router.post('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { approved: true, verificationStatus: 'verified' },
      { new: true }
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop approved', shop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops/:id/reject (admin only)
router.post('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { approved: false, verificationStatus: 'rejected', rejectionReason: req.body.reason },
      { new: true }
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop rejected', shop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/status/pending (admin only) — list pending approvals
router.get('/status/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const pending = await Shop.find({ approved: false }).populate('ownerId', 'name email phone');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/:id/analytics (shop owner) — shopkeeper analytics
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Return mock analytics
    res.json({
      shopId: shop._id,
      totalOrders: 156,
      totalRevenue: 124580,
      avgRating: shop.rating || 4.5,
      uniqueCustomers: 89,
      topProducts: [],
      monthlyTrend: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
