import express from 'express';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories — all active categories (public)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, image, subcategories } = req.body;
    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await Category.create({ name, description, image, subcategories });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id (admin — soft delete)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deactivated', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories/:id/subcategory (admin only)
router.post('/:id/subcategory', protect, authorize('admin'), async (req, res) => {
  try {
    const { subcategory } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    if (category.subcategories.includes(subcategory)) {
      return res.status(400).json({ message: 'Subcategory already exists' });
    }
    category.subcategories.push(subcategory);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id/subcategory (admin only)
router.delete('/:id/subcategory', protect, authorize('admin'), async (req, res) => {
  try {
    const { subcategory } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    category.subcategories = category.subcategories.filter(s => s !== subcategory);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
