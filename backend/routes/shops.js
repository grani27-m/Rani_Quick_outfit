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
    // Check if shopkeeper already has a shop
    const existing = await Shop.findOne({ ownerId: req.user._id });
    if (existing) return res.status(409).json({ message: 'You already have a registered shop' });

    // City → GPS fallback mapping
    const cityCoords = {
      'Vellore':   [79.1325, 12.9165],
      'Chennai':   [80.2707, 13.0827],
      'Mumbai':    [72.8777, 19.0760],
      'Delhi':     [77.2090, 28.6139],
      'Bangalore': [77.5946, 12.9716],
      'Hyderabad': [78.4867, 17.3850],
      'Pune':      [73.8567, 18.5204],
      'Kolkata':   [88.3639, 22.5726],
      'Jaipur':    [75.7873, 26.9124],
      'Lucknow':   [80.9462, 26.8467],
      'Ahmedabad': [72.5714, 23.0225],
    };
    const coords = cityCoords[req.body.city] || [77.2090, 28.6139];

    const shop = await Shop.create({
      ownerId: req.user._id,
      name: req.body.name,
      description: req.body.description || '',
      category: req.body.category || 'ethnic',
      address: req.body.address || '',
      city: req.body.city || 'Delhi',
      phone: req.body.phone || req.user.phone || '',
      location: { type: 'Point', coordinates: coords },
      operatingHours: { open: req.body.openTime || '09:00', close: req.body.closeTime || '21:00' },
      approved: false,
      verificationStatus: 'pending',
      isLive: false
    });
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
