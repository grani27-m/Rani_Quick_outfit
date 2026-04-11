import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload
// Requires authentication. Expects form-data with the key "image"
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid format.' });
    }
    // Return the secure Cloudinary URL
    res.status(200).json({ 
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
