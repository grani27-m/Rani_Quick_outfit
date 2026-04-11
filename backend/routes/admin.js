import express from 'express';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes
router.use(protect, authorize('admin'));

// GET /api/admin/stats — platform dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCustomers, totalShopkeepers, totalShops, approvedShops, pendingShops,
           totalProducts, totalOrders, deliveredOrders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'shopkeeper' }),
      Shop.countDocuments(),
      Shop.countDocuments({ approved: true }),
      Shop.countDocuments({ approved: false }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'delivered' })
    ]);

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Monthly revenue for charts
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalUsers, totalCustomers, totalShopkeepers,
      totalShops, approvedShops, pendingShops,
      totalProducts, totalOrders, deliveredOrders,
      totalRevenue, monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users — list all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/block — block/unblock user
router.patch('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/shops/pending — pending shop approvals
router.get('/shops/pending', async (req, res) => {
  try {
    const shops = await Shop.find({ approved: false })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/shops/:id/approve — approve shop
router.patch('/shops/:id/approve', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { approved: true, isLive: true },
      { new: true }
    ).populate('ownerId', 'name email');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop approved', shop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/shops/:id/reject — reject shop
router.patch('/shops/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { approved: false, isLive: false },
      { new: true }
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop rejected', shop, reason });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/orders — all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/reports — detailed reports
router.get('/reports', async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const matchStage = Object.keys(dateFilter).length > 0
      ? { $match: { createdAt: dateFilter, status: 'delivered' } }
      : { $match: { status: 'delivered' } };

    // Top selling products
    const topProducts = await Order.aggregate([
      matchStage,
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Top shops
    const topShops = await Order.aggregate([
      matchStage,
      { $group: { _id: '$shopId', totalOrders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Revenue by day (last 30 days)
    const dailyRevenue = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ topProducts, topShops, dailyRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
