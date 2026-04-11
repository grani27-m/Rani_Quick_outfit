import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist — get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate('products', 'name price originalPrice images stock rating reviewCount emoji category colours sizes');

    if (!wishlist) {
      wishlist = { userId: req.user._id, products: [] };
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist/:productId — add product to wishlist
router.post('/:productId', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    if (wishlist.products.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push(req.params.productId);
    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id)
      .populate('products', 'name price originalPrice images stock rating reviewCount emoji category');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/wishlist/:productId — remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== req.params.productId
    );
    await wishlist.save();
    res.json({ message: 'Removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist/:productId/move-to-cart — move from wishlist to cart
router.post('/:productId/move-to-cart', protect, async (req, res) => {
  try {
    const { size, color } = req.body;

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        id => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }

    // Add to cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      item => item.productId.toString() === req.params.productId
    );
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += 1;
    } else {
      cart.items.push({
        productId: req.params.productId,
        quantity: 1,
        size: size || '',
        color: color || ''
      });
    }
    await cart.save();

    res.json({ message: 'Moved to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/wishlist — clear wishlist
router.delete('/', protect, async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ userId: req.user._id }, { products: [] });
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
