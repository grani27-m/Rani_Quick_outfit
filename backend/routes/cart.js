import express from 'express';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart — get user's cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'name price originalPrice images stock sizes colours emoji category');

    if (!cart) {
      cart = { userId: req.user._id, items: [] };
    }

    // Calculate totals
    let subtotal = 0;
    const validItems = [];
    for (const item of cart.items || []) {
      if (item.productId) {
        subtotal += item.productId.price * item.quantity;
        validItems.push(item);
      }
    }

    res.json({
      items: validItems,
      subtotal,
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart — add item to cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item with same product/size/color already in cart
    const existingIdx = cart.items.findIndex(
      item => item.productId.toString() === productId &&
              item.size === (size || '') &&
              item.color === (color || '')
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, size: size || '', color: color || '' });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate('items.productId', 'name price originalPrice images stock sizes colours emoji category');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/cart/:itemId — update cart item quantity
router.patch('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/:itemId — remove item from cart
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ message: 'Item removed', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart — clear entire cart
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
