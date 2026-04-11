import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews — create review (customer only, must have purchased)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, shopId, orderId, rating, comment, images } = req.body;

    // Verify the user has an order containing this product
    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ message: 'You can only review delivered orders' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ userId: req.user._id, productId, orderId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product for this order' });
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      shopId: shopId || order.shopId,
      orderId,
      rating,
      comment,
      images: images || [],
      isVerifiedPurchase: true
    });

    // Update product and shop ratings
    if (productId) await Review.calcAverageRating(productId);
    if (shopId || order.shopId) await Review.calcShopRating(shopId || order.shopId);

    const populated = await Review.findById(review._id).populate('userId', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/product/:productId — get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;
    let query = { productId: req.params.productId };
    if (rating) query.rating = Number(rating);

    let sortObj = { createdAt: -1 };
    if (sort === 'highest') sortObj = { rating: -1 };
    else if (sort === 'lowest') sortObj = { rating: 1 };
    else if (sort === 'helpful') sortObj = { helpfulCount: -1 };

    const reviews = await Review.find(query)
      .populate('userId', 'name avatar')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: { productId: reviews.length > 0 ? reviews[0].productId : null } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / limit), distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/shop/:shopId — get shop reviews
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ shopId: req.params.shopId })
      .populate('userId', 'name avatar')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments({ shopId: req.params.shopId });
    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/reviews/:id — update own review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    const { rating, comment, images } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;
    await review.save();

    // Recalculate ratings
    if (review.productId) await Review.calcAverageRating(review.productId);
    if (review.shopId) await Review.calcShopRating(review.shopId);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/reviews/:id — delete own review or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { productId, shopId } = review;
    await Review.findByIdAndDelete(req.params.id);

    if (productId) await Review.calcAverageRating(productId);
    if (shopId) await Review.calcShopRating(shopId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews/:id/helpful — mark review as helpful
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.helpfulBy.includes(req.user._id)) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== req.user._id.toString());
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }
    await review.save();
    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
