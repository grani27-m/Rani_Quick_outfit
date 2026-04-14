import express from 'express';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products — list with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sizes, sort, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (sizes) query.sizes = { $in: sizes.split(',') };

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const products = await Product.find(query)
      .populate('shopId', 'name location address rating')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/nearby — products from nearby shops
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng query params required' });

    const Shop = (await import('../models/Shop.js')).default;
    const nearbyShops = await Shop.find({
      approved: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('_id');

    const shopIds = nearbyShops.map(s => s._id);
    const products = await Product.find({ shopId: { $in: shopIds }, isActive: true })
      .populate('shopId', 'name location address rating')
      .limit(30);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/tone/:toneId — products by skin tone compatibility
router.get('/tone/:toneId', async (req, res) => {
  try {
    const { toneId } = req.params;
    const valid = ['fair', 'light', 'medium', 'wheatish', 'dusky', 'dark'];
    if (!valid.includes(toneId)) return res.status(400).json({ message: 'Invalid tone' });

    const products = await Product.find({
      isActive: true,
      [`toneCompatibility.${toneId}`]: { $gte: 75 }
    })
      .populate('shopId', 'name location address')
      .sort({ [`toneCompatibility.${toneId}`]: -1 })
      .limit(20);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId', 'name location address rating phone category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products (shopkeeper only)
router.post('/', protect, authorize('shopkeeper', 'admin'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/products/:id
router.patch('/:id', protect, authorize('shopkeeper', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, authorize('shopkeeper', 'admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/ai/recommendations — AI recommendations based on skin tone
router.get('/ai/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    const tone = user.skinTone || 'medium';
    
    const recommendations = await Product.find({
      isActive: true,
      [`toneCompatibility.${tone}`]: { $gte: 75 }
    })
      .populate('shopId', 'name location address')
      .limit(12)
      .sort({ [`toneCompatibility.${tone}`]: -1 });
    
    res.json({ tone, recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id/related — related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const related = await Product.find({
      _id: { $ne: req.params.id },
      isActive: true,
      $or: [
        { category: product.category },
        { colours: { $in: product.colours } }
      ]
    }).limit(8);
    
    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/featured — featured products
router.get('/featured/all', async (req, res) => {
  try {
    const featured = await Product.find({ isActive: true })
      .populate('shopId', 'name')
      .sort({ rating: -1 })
      .limit(10);
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/trending — trending products
router.get('/trending/all', async (req, res) => {
  try {
    const trending = await Product.find({ isActive: true })
      .populate('shopId', 'name')
      .sort({ reviewCount: -1 })
      .limit(10);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
