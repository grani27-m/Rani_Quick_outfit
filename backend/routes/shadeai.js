import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Skin tone color mapping data
const SKIN_TONES = {
  fair: {
    recs: ['Pastels', 'Lavender', 'Baby Blue', 'Rose Pink', 'Mint', 'Soft Yellow'],
    avoid: ['Neon', 'Very Dark Brown'],
    hexRecs: ['#E6E6FA', '#B0C4DE', '#FFB6C1', '#98FB98', '#FFFACD', '#DDA0DD'],
    hexAvoid: ['#39FF14', '#3E2723'],
    confidence: { Pastels: 92, Lavender: 88, 'Baby Blue': 85, 'Rose Pink': 90, Mint: 82, 'Soft Yellow': 78 }
  },
  light: {
    recs: ['Coral', 'Peach', 'Sky Blue', 'Cream', 'Light Purple', 'Soft White'],
    avoid: ['Orange', 'Neon Yellow'],
    hexRecs: ['#FF7F50', '#FFDAB9', '#87CEEB', '#FFFDD0', '#B19CD9', '#F5F5F5'],
    hexAvoid: ['#FF8C00', '#DFFF00'],
    confidence: { Coral: 90, Peach: 88, 'Sky Blue': 85, Cream: 82, 'Light Purple': 80, 'Soft White': 78 }
  },
  medium: {
    recs: ['Earthy Tones', 'Olive Green', 'Mustard', 'Burnt Orange', 'Teal', 'Brick Red'],
    avoid: ['Pastel Yellow', 'Pale Pink'],
    hexRecs: ['#8B7355', '#808000', '#FFDB58', '#CC5500', '#008080', '#CB4154'],
    hexAvoid: ['#FDFD96', '#FFD1DC'],
    confidence: { 'Earthy Tones': 92, 'Olive Green': 88, Mustard: 90, 'Burnt Orange': 85, Teal: 87, 'Brick Red': 83 }
  },
  wheatish: {
    recs: ['Gold', 'Bronze', 'Deep Green', 'Royal Blue', 'Maroon', 'Rust'],
    avoid: ['Nude', 'Very Light Beige'],
    hexRecs: ['#FFD700', '#CD7F32', '#006400', '#4169E1', '#800000', '#B7410E'],
    hexAvoid: ['#C3B091', '#F5F5DC'],
    confidence: { Gold: 95, Bronze: 90, 'Deep Green': 88, 'Royal Blue': 92, Maroon: 87, Rust: 85 }
  },
  dusky: {
    recs: ['Jewel Tones', 'Electric Blue', 'Fuchsia', 'Emerald', 'Wine', 'Bold Red'],
    avoid: ['Dusty Pink', 'Light Brown'],
    hexRecs: ['#9B59B6', '#007FFF', '#FF00FF', '#50C878', '#722F37', '#FF0000'],
    hexAvoid: ['#C9A9A6', '#C4A882'],
    confidence: { 'Jewel Tones': 93, 'Electric Blue': 90, Fuchsia: 88, Emerald: 92, Wine: 85, 'Bold Red': 87 }
  },
  dark: {
    recs: ['White', 'Ivory', 'Bright Yellow', 'Hot Pink', 'Electric Blue', 'Bright Red'],
    avoid: ['Very Dark Navy', 'Dark Brown'],
    hexRecs: ['#FFFFFF', '#FFFFF0', '#FFFF00', '#FF69B4', '#007FFF', '#FF0000'],
    hexAvoid: ['#000080', '#3E2723'],
    confidence: { White: 95, Ivory: 90, 'Bright Yellow': 92, 'Hot Pink': 88, 'Electric Blue': 93, 'Bright Red': 90 }
  }
};

// POST /api/shadeai/detect — detect skin tone from selfie using Gemini
router.post('/detect', protect, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    let detectedTone = 'medium'; // default fallback

    // Try Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent([
          { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
          `You are a skin tone analyzer. Look at the person's face in this image.
           Respond with ONLY one word from: fair, light, medium, wheatish, dusky, dark
           No explanation. No punctuation. Just the single word.`
        ]);

        const tone = result.response.text().trim().toLowerCase();
        const valid = ['fair', 'light', 'medium', 'wheatish', 'dusky', 'dark'];
        if (valid.includes(tone)) {
          detectedTone = tone;
        }
      } catch (aiError) {
        console.error('Gemini API error:', aiError.message);
        // Falls back to 'medium'
      }
    }

    // Save detected tone to user profile
    await User.findByIdAndUpdate(req.user._id, { skinTone: detectedTone });

    res.json({
      success: true,
      tone: detectedTone,
      recommendations: SKIN_TONES[detectedTone]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shadeai/tones — get all tone data (public)
router.get('/tones', (req, res) => {
  res.json(SKIN_TONES);
});

// GET /api/shadeai/recommendations/:tone — get recommendations for a tone
router.get('/recommendations/:tone', (req, res) => {
  const tone = req.params.tone.toLowerCase();
  const data = SKIN_TONES[tone];
  if (!data) {
    return res.status(400).json({ message: 'Invalid skin tone. Valid: fair, light, medium, wheatish, dusky, dark' });
  }
  res.json({ tone, ...data });
});

export default router;
