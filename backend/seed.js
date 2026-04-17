import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'
import Shop from './models/Shop.js'
import Product from './models/Product.js'

dotenv.config()

const CITY_COORDS = {
  Vellore:   [79.1325, 12.9165],
  Chennai:   [80.2707, 13.0827],
  Katpadi:   [79.1535, 12.9592],
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  
  // Clear existing seed data only (keep real registered users)
  await Product.deleteMany({ isSeeded: true })
  await Shop.deleteMany({ isSeeded: true })
  
  const hash = await bcrypt.hash('shop123', 12)
  
  // ── SEED USERS (only if not exist) ──────────────────────────
  let priya = await User.findOne({ email: 'priya@boutique.com' })
  if (!priya) priya = await User.create({
    name: 'Priya Sharma', email: 'priya@boutique.com',
    phone: '9876543210', password: hash,
    role: 'shopkeeper', isActive: true, isVerified: true
  })

  let fashionUser = await User.findOne({ email: 'fashion@hub.com' })
  if (!fashionUser) fashionUser = await User.create({
    name: 'Fashion Hub Owner', email: 'fashion@hub.com',
    phone: '9876543211', password: hash,
    role: 'shopkeeper', isActive: true, isVerified: true
  })

  let kidsUser = await User.findOne({ email: 'kids@wear.com' })
  if (!kidsUser) kidsUser = await User.create({
    name: 'Kids Wear Owner', email: 'kids@wear.com',
    phone: '9876543212', password: hash,
    role: 'shopkeeper', isActive: true, isVerified: true
  })

  // ── SEED SHOPS (3 shops near Vellore) ──────────────────────
  const meena = await Shop.create({
    ownerId: priya._id,
    name: 'Meena Boutique',
    description: 'Premium sarees, ethnic wear and kurtas. Handpicked collection.',
    category: 'ethnic',
    location: { type: 'Point', coordinates: [79.1325, 12.9165] },
    address: 'MG Road, Vellore',
    city: 'Vellore',
    isApproved: true,
    isLive: true,
    rating: 4.8,
    totalReviews: 324,
    operatingHours: { open: '10:00', close: '21:00' },
    isSeeded: true
  })

  const fashionHub = await Shop.create({
    ownerId: fashionUser._id,
    name: 'Fashion Hub',
    description: 'Modern western and casual wear for all ages.',
    category: 'western',
    location: { type: 'Point', coordinates: [79.1390, 12.9220] },
    address: 'Gandhi Nagar, Vellore',
    city: 'Vellore',
    isApproved: true,
    isLive: true,
    rating: 4.5,
    totalReviews: 189,
    operatingHours: { open: '10:00', close: '21:00' },
    isSeeded: true
  })

  const kidsWorld = await Shop.create({
    ownerId: kidsUser._id,
    name: 'Kids World',
    description: 'Everything for children — from newborn to teens.',
    category: 'kids',
    location: { type: 'Point', coordinates: [79.1280, 12.9100] },
    address: 'Katpadi Road, Vellore',
    city: 'Vellore',
    isApproved: true,
    isLive: true,
    rating: 4.6,
    totalReviews: 156,
    operatingHours: { open: '09:00', close: '20:00' },
    isSeeded: true
  })

  // ── SEED PRODUCTS ─────────────────────────────────────────────
  // Helper to make 8-10 products per category
  const IMAGES = {
    saree: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      'https://images.unsplash.com/photo-1583391733956-6c77a2a70d8f?w=800',
      'https://images.unsplash.com/photo-1617627143233-3a58c2f9b519?w=800',
    ],
    kurta: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800',
      'https://images.unsplash.com/photo-1583391733956-6c77a2a70d8f?w=800',
    ],
    western: [
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    ],
    ethnic: [
      'https://images.unsplash.com/photo-1583391733956-6c77a2a70d8f?w=800',
      'https://images.unsplash.com/photo-1617627143233-3a58c2f9b519?w=800',
    ],
    formal: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b3be4?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    ],
    casual: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800',
    ],
    kids: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800',
    ],
    mens: [
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
      'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
    ],
  }

  const products = [
    // ─── MEENA BOUTIQUE: SAREE (8 products) ───────────────────
    { shopId: meena._id, name: 'Banarasi Silk Saree', category: 'saree',
      price: 3499, originalPrice: 4999, discount: 30, stock: 15,
      images: [IMAGES.saree[0]], sizes: ['Free Size'],
      colors: ['Red', 'Gold'], fabric: 'Silk',
      description: 'Handwoven Banarasi silk saree with zari border. Perfect for weddings.',
      toneCompatibility: { fair: 85, light: 80, medium: 92, wheatish: 88, dusky: 75, dark: 70 },
      rating: 4.8, totalReviews: 89 },

    { shopId: meena._id, name: 'Chiffon Party Saree', category: 'saree',
      price: 1899, originalPrice: 2599, discount: 27, stock: 20,
      images: [IMAGES.saree[1]], sizes: ['Free Size'],
      colors: ['Blue', 'Pink'], fabric: 'Chiffon',
      description: 'Lightweight chiffon saree with embroidered border.',
      toneCompatibility: { fair: 90, light: 85, medium: 78, wheatish: 72, dusky: 68, dark: 65 },
      rating: 4.5, totalReviews: 67 },

    { shopId: meena._id, name: 'Cotton Tant Saree', category: 'saree',
      price: 899, originalPrice: 1299, discount: 31, stock: 25,
      images: [IMAGES.saree[2]], sizes: ['Free Size'],
      colors: ['White', 'Yellow'], fabric: 'Cotton',
      description: 'Traditional cotton tant saree. Ideal for daily wear.',
      toneCompatibility: { fair: 75, light: 80, medium: 85, wheatish: 82, dusky: 90, dark: 95 },
      rating: 4.3, totalReviews: 43 },

    { shopId: meena._id, name: 'Kanjivaram Silk Saree', category: 'saree',
      price: 8999, originalPrice: 11999, discount: 25, stock: 8,
      images: [IMAGES.saree[0]], sizes: ['Free Size'],
      colors: ['Green', 'Purple', 'Red'], fabric: 'Pure Silk',
      description: 'Authentic Kanjivaram silk from Tamil Nadu weavers.',
      toneCompatibility: { fair: 70, light: 75, medium: 88, wheatish: 90, dusky: 85, dark: 80 },
      rating: 4.9, totalReviews: 112 },

    { shopId: meena._id, name: 'Georgette Printed Saree', category: 'saree',
      price: 1299, originalPrice: 1799, discount: 28, stock: 18,
      images: [IMAGES.saree[1]], sizes: ['Free Size'],
      colors: ['Orange', 'Maroon'], fabric: 'Georgette',
      description: 'Floral printed georgette saree with contrast blouse piece.',
      toneCompatibility: { fair: 68, light: 72, medium: 85, wheatish: 92, dusky: 88, dark: 82 },
      rating: 4.4, totalReviews: 55 },

    { shopId: meena._id, name: 'Linen Handloom Saree', category: 'saree',
      price: 2199, originalPrice: 2999, discount: 27, stock: 12,
      images: [IMAGES.saree[2]], sizes: ['Free Size'],
      colors: ['Beige', 'Grey'], fabric: 'Linen',
      description: 'Eco-friendly linen handloom saree. Breathable and elegant.',
      ecoScore: 88,
      toneCompatibility: { fair: 80, light: 78, medium: 75, wheatish: 70, dusky: 65, dark: 60 },
      rating: 4.6, totalReviews: 78 },

    { shopId: meena._id, name: 'Mysore Silk Saree', category: 'saree',
      price: 5499, originalPrice: 7499, discount: 27, stock: 10,
      images: [IMAGES.saree[0]], sizes: ['Free Size'],
      colors: ['Cream', 'Gold'], fabric: 'Pure Silk',
      description: 'GI-tagged Mysore silk with traditional motifs.',
      toneCompatibility: { fair: 88, light: 85, medium: 80, wheatish: 78, dusky: 72, dark: 68 },
      rating: 4.8, totalReviews: 94 },

    { shopId: meena._id, name: 'Tussar Silk Saree', category: 'saree',
      price: 3999, originalPrice: 5499, discount: 27, stock: 7,
      images: [IMAGES.saree[1]], sizes: ['Free Size'],
      colors: ['Rust', 'Brown'], fabric: 'Tussar Silk',
      description: 'Natural tussar silk with tribal embroidery.',
      toneCompatibility: { fair: 65, light: 70, medium: 82, wheatish: 90, dusky: 92, dark: 88 },
      rating: 4.7, totalReviews: 61 },

    // ─── MEENA BOUTIQUE: KURTA (8 products) ───────────────────
    { shopId: meena._id, name: 'Embroidered Silk Kurta', category: 'kurta',
      price: 1899, originalPrice: 2599, discount: 27, stock: 25,
      images: [IMAGES.kurta[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Yellow', 'White'], fabric: 'Silk',
      description: 'Hand-embroidered silk kurta. Perfect for weddings and parties.',
      toneCompatibility: { fair: 75, light: 80, medium: 88, wheatish: 85, dusky: 70, dark: 65 },
      rating: 4.7, totalReviews: 89, isFeatured: true },

    { shopId: meena._id, name: 'Cotton Straight Kurta', category: 'kurta',
      price: 699, originalPrice: 999, discount: 30, stock: 40,
      images: [IMAGES.kurta[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Blue', 'Green'], fabric: 'Cotton',
      description: 'Comfortable daily wear cotton kurta with subtle prints.',
      toneCompatibility: { fair: 85, light: 85, medium: 85, wheatish: 85, dusky: 85, dark: 85 },
      rating: 4.3, totalReviews: 156 },

    { shopId: meena._id, name: 'Anarkali Kurta Set', category: 'kurta',
      price: 2499, originalPrice: 3499, discount: 29, stock: 15,
      images: [IMAGES.kurta[0]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Purple'], fabric: 'Georgette',
      description: 'Flared anarkali kurta set with matching dupatta.',
      toneCompatibility: { fair: 88, light: 85, medium: 78, wheatish: 72, dusky: 68, dark: 65 },
      rating: 4.6, totalReviews: 73 },

    { shopId: meena._id, name: 'Palazzo Kurta Set', category: 'kurta',
      price: 1599, originalPrice: 2199, discount: 27, stock: 20,
      images: [IMAGES.kurta[1]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Teal', 'Maroon'], fabric: 'Rayon',
      description: 'Trendy palazzo and kurta combo for casual occasions.',
      toneCompatibility: { fair: 72, light: 75, medium: 82, wheatish: 88, dusky: 85, dark: 80 },
      rating: 4.4, totalReviews: 48 },

    { shopId: meena._id, name: 'Chikankari Kurta', category: 'kurta',
      price: 2199, originalPrice: 2999, discount: 27, stock: 12,
      images: [IMAGES.kurta[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Pastel Pink', 'Mint'], fabric: 'Muslin',
      description: 'Authentic Lucknow chikankari embroidery on fine muslin.',
      ecoScore: 75,
      toneCompatibility: { fair: 90, light: 88, medium: 80, wheatish: 75, dusky: 68, dark: 62 },
      rating: 4.8, totalReviews: 102 },

    { shopId: meena._id, name: 'Bandhani Kurta', category: 'kurta',
      price: 1299, originalPrice: 1799, discount: 28, stock: 18,
      images: [IMAGES.kurta[1]], sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Red', 'Yellow', 'Orange'], fabric: 'Cotton',
      description: 'Traditional bandhani tie-dye kurta from Gujarat artisans.',
      toneCompatibility: { fair: 68, light: 72, medium: 85, wheatish: 90, dusky: 88, dark: 85 },
      rating: 4.5, totalReviews: 64 },

    { shopId: meena._id, name: 'Printed Rayon Kurta', category: 'kurta',
      price: 799, originalPrice: 1099, discount: 27, stock: 35,
      images: [IMAGES.kurta[0]], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Multicolor', 'Blue', 'Green'], fabric: 'Rayon',
      description: 'Vibrant floral printed rayon kurta for everyday wear.',
      toneCompatibility: { fair: 80, light: 82, medium: 80, wheatish: 78, dusky: 75, dark: 70 },
      rating: 4.2, totalReviews: 89 },

    { shopId: meena._id, name: 'Pathani Kurta Pyjama', category: 'kurta',
      price: 1999, originalPrice: 2799, discount: 29, stock: 14,
      images: [IMAGES.kurta[1]], sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Cream', 'Beige'], fabric: 'Linen',
      description: 'Classic Pathani set with pin-tuck detail and side pockets.',
      toneCompatibility: { fair: 82, light: 80, medium: 85, wheatish: 88, dusky: 85, dark: 90 },
      rating: 4.6, totalReviews: 57 },

    // ─── FASHION HUB: WESTERN (8 products) ────────────────────
    { shopId: fashionHub._id, name: 'Cotton Crop Top & Jeans', category: 'western',
      price: 899, originalPrice: 1299, discount: 31, stock: 30,
      images: [IMAGES.western[0]], sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Yellow', 'White'], fabric: 'Cotton',
      description: 'Trendy crop top with high-waist jeans. Perfect for casual outings.',
      ecoScore: 72,
      toneCompatibility: { fair: 78, light: 82, medium: 75, wheatish: 70, dusky: 65, dark: 60 },
      rating: 4.5, totalReviews: 112, isFeatured: true },

    { shopId: fashionHub._id, name: 'Floral Midi Dress', category: 'western',
      price: 1299, originalPrice: 1799, discount: 28, stock: 22,
      images: [IMAGES.western[1]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Blue', 'White'], fabric: 'Polyester',
      description: 'Flowy floral midi dress ideal for brunch and events.',
      toneCompatibility: { fair: 88, light: 85, medium: 75, wheatish: 68, dusky: 62, dark: 58 },
      rating: 4.6, totalReviews: 78 },

    { shopId: fashionHub._id, name: 'Denim Jacket', category: 'western',
      price: 1599, originalPrice: 2299, discount: 30, stock: 18,
      images: [IMAGES.western[2]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue', 'Black'], fabric: 'Denim',
      description: 'Classic denim jacket. Pairs well with any outfit.',
      toneCompatibility: { fair: 80, light: 80, medium: 80, wheatish: 80, dusky: 80, dark: 80 },
      rating: 4.7, totalReviews: 95 },

    { shopId: fashionHub._id, name: 'Palazzo Trousers', category: 'western',
      price: 799, originalPrice: 1099, discount: 27, stock: 28,
      images: [IMAGES.western[0]], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'White'], fabric: 'Crepe',
      description: 'Wide-leg palazzo for maximum comfort and style.',
      toneCompatibility: { fair: 72, light: 75, medium: 80, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.4, totalReviews: 61 },

    { shopId: fashionHub._id, name: 'Off-Shoulder Top', category: 'western',
      price: 699, originalPrice: 999, discount: 30, stock: 25,
      images: [IMAGES.western[1]], sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Red', 'White', 'Black'], fabric: 'Cotton',
      description: 'Trendy off-shoulder top. Perfect for summer outings.',
      toneCompatibility: { fair: 70, light: 75, medium: 80, wheatish: 85, dusky: 90, dark: 88 },
      rating: 4.3, totalReviews: 44 },

    { shopId: fashionHub._id, name: 'High-Waist Jeans', category: 'western',
      price: 1799, originalPrice: 2499, discount: 28, stock: 20,
      images: [IMAGES.western[2]], sizes: ['26', '28', '30', '32', '34'],
      colors: ['Blue', 'Black', 'Grey'], fabric: 'Denim',
      description: 'Stretch high-waist skinny jeans with comfort waistband.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.6, totalReviews: 88 },

    { shopId: fashionHub._id, name: 'Blazer & Trouser Set', category: 'western',
      price: 3499, originalPrice: 4999, discount: 30, stock: 12,
      images: [IMAGES.western[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Grey', 'Black'], fabric: 'Polyester Blend',
      description: 'Power dressing blazer set. Ideal for work and events.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.7, totalReviews: 53 },

    { shopId: fashionHub._id, name: 'Boho Printed Skirt', category: 'western',
      price: 999, originalPrice: 1399, discount: 29, stock: 16,
      images: [IMAGES.western[1]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Multicolor', 'Earthy'], fabric: 'Rayon',
      description: 'Bohemian printed midi skirt with elastic waistband.',
      ecoScore: 65,
      toneCompatibility: { fair: 68, light: 72, medium: 85, wheatish: 90, dusky: 88, dark: 82 },
      rating: 4.4, totalReviews: 39 },

    // ─── FASHION HUB: ETHNIC (8 products) ─────────────────────
    { shopId: fashionHub._id, name: 'Festive Anarkali Set', category: 'ethnic',
      price: 1499, originalPrice: 2199, discount: 32, stock: 18,
      images: [IMAGES.ethnic[0]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Red', 'Maroon'], fabric: 'Georgette',
      description: 'Festive anarkali gown with embroidered yoke.',
      toneCompatibility: { fair: 70, light: 72, medium: 82, wheatish: 88, dusky: 90, dark: 85 },
      rating: 4.8, totalReviews: 97, isFeatured: true },

    { shopId: fashionHub._id, name: 'Sharara Set', category: 'ethnic',
      price: 2999, originalPrice: 3999, discount: 25, stock: 10,
      images: [IMAGES.ethnic[1]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Peach'], fabric: 'Net',
      description: 'Beautiful sharara set with sequin work.',
      toneCompatibility: { fair: 85, light: 82, medium: 75, wheatish: 70, dusky: 65, dark: 60 },
      rating: 4.6, totalReviews: 51 },

    { shopId: fashionHub._id, name: 'Lehenga Choli', category: 'ethnic',
      price: 5999, originalPrice: 8499, discount: 29, stock: 8,
      images: [IMAGES.ethnic[0]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Green', 'Gold'], fabric: 'Silk',
      description: 'Bridal lehenga with heavy embroidery and dupatta.',
      toneCompatibility: { fair: 72, light: 75, medium: 85, wheatish: 90, dusky: 88, dark: 82 },
      rating: 4.9, totalReviews: 134 },

    { shopId: fashionHub._id, name: 'Salwar Kameez', category: 'ethnic',
      price: 1199, originalPrice: 1699, discount: 29, stock: 28,
      images: [IMAGES.ethnic[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Blue', 'Green', 'Pink'], fabric: 'Cotton',
      description: 'Comfortable cotton salwar kameez. Ideal for daily wear.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 80, dusky: 78, dark: 75 },
      rating: 4.3, totalReviews: 88 },

    { shopId: fashionHub._id, name: 'Patiala Suit', category: 'ethnic',
      price: 1599, originalPrice: 2199, discount: 27, stock: 15,
      images: [IMAGES.ethnic[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Yellow', 'Orange', 'Purple'], fabric: 'Phulkari Cotton',
      description: 'Traditional Patiala suit with phulkari embroidery.',
      toneCompatibility: { fair: 68, light: 72, medium: 82, wheatish: 88, dusky: 90, dark: 85 },
      rating: 4.5, totalReviews: 62 },

    { shopId: fashionHub._id, name: 'Indo-Western Dress', category: 'ethnic',
      price: 2799, originalPrice: 3799, discount: 26, stock: 11,
      images: [IMAGES.ethnic[1]], sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Teal', 'Wine'], fabric: 'Crepe',
      description: 'Fusion Indo-western gown with cape overlay.',
      toneCompatibility: { fair: 72, light: 75, medium: 85, wheatish: 88, dusky: 90, dark: 88 },
      rating: 4.7, totalReviews: 43 },

    { shopId: fashionHub._id, name: 'Chaniya Choli', category: 'ethnic',
      price: 4499, originalPrice: 6199, discount: 27, stock: 9,
      images: [IMAGES.ethnic[0]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Red', 'Orange', 'Green'], fabric: 'Silk',
      description: 'Navratri special chaniya choli with mirror work.',
      toneCompatibility: { fair: 68, light: 70, medium: 82, wheatish: 88, dusky: 92, dark: 90 },
      rating: 4.8, totalReviews: 76 },

    { shopId: fashionHub._id, name: 'Flared Kurti Set', category: 'ethnic',
      price: 1299, originalPrice: 1799, discount: 28, stock: 22,
      images: [IMAGES.ethnic[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Mint', 'Lavender', 'Coral'], fabric: 'Rayon',
      description: 'A-line flared kurti with printed palazzo.',
      toneCompatibility: { fair: 88, light: 85, medium: 78, wheatish: 72, dusky: 68, dark: 62 },
      rating: 4.4, totalReviews: 55 },

    // ─── FASHION HUB: FORMAL (8 products) ─────────────────────
    { shopId: fashionHub._id, name: 'Slim Fit Formal Blazer', category: 'formal',
      price: 2999, originalPrice: 4599, discount: 35, stock: 14,
      images: [IMAGES.formal[0]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'Charcoal'], fabric: 'Polyester Blend',
      description: 'Office-ready slim fit blazer with notched lapel.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.9, totalReviews: 67, isFeatured: true },

    { shopId: fashionHub._id, name: 'Formal Dress Shirt', category: 'formal',
      price: 899, originalPrice: 1299, discount: 31, stock: 35,
      images: [IMAGES.formal[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Light Blue', 'Grey'], fabric: 'Cotton',
      description: 'Classic formal shirt with wrinkle-resistant finish.',
      toneCompatibility: { fair: 80, light: 80, medium: 85, wheatish: 88, dusky: 90, dark: 92 },
      rating: 4.5, totalReviews: 122 },

    { shopId: fashionHub._id, name: 'Business Suit Set', category: 'formal',
      price: 6999, originalPrice: 9999, discount: 30, stock: 8,
      images: [IMAGES.formal[0]], sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Charcoal', 'Navy', 'Grey'], fabric: 'Wool Blend',
      description: 'Premium 2-piece business suit. Interview or boardroom ready.',
      toneCompatibility: { fair: 80, light: 82, medium: 85, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.8, totalReviews: 45 },

    { shopId: fashionHub._id, name: 'Formal Trousers', category: 'formal',
      price: 1299, originalPrice: 1799, discount: 28, stock: 22,
      images: [IMAGES.formal[1]], sizes: ['28', '30', '32', '34', '36'],
      colors: ['Black', 'Navy', 'Grey'], fabric: 'Polyester',
      description: 'Pleated formal trousers with crease-resistant fabric.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.4, totalReviews: 78 },

    { shopId: fashionHub._id, name: 'Pencil Skirt', category: 'formal',
      price: 999, originalPrice: 1399, discount: 29, stock: 18,
      images: [IMAGES.formal[0]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Charcoal'], fabric: 'Polyester',
      description: 'Knee-length pencil skirt with back slit.',
      toneCompatibility: { fair: 72, light: 75, medium: 80, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.5, totalReviews: 56 },

    { shopId: fashionHub._id, name: 'Shift Dress', category: 'formal',
      price: 1799, originalPrice: 2499, discount: 28, stock: 13,
      images: [IMAGES.formal[1]], sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Black', 'Burgundy'], fabric: 'Crepe',
      description: 'Classic shift dress. Perfect for corporate meetings.',
      toneCompatibility: { fair: 68, light: 72, medium: 82, wheatish: 88, dusky: 90, dark: 88 },
      rating: 4.6, totalReviews: 48 },

    { shopId: fashionHub._id, name: 'Waistcoat', category: 'formal',
      price: 1499, originalPrice: 2099, discount: 29, stock: 16,
      images: [IMAGES.formal[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Grey', 'Navy'], fabric: 'Polyester Blend',
      description: 'Smart 5-button waistcoat for formal and festive wear.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.4, totalReviews: 38 },

    { shopId: fashionHub._id, name: 'Formal Saree Blouse', category: 'formal',
      price: 699, originalPrice: 999, discount: 30, stock: 30,
      images: [IMAGES.formal[1]], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy'], fabric: 'Silk Blend',
      description: 'Tailored blouse with peter pan collar. Pairs with any saree.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.3, totalReviews: 82 },

    // ─── FASHION HUB: CASUAL (8 products) ─────────────────────
    { shopId: fashionHub._id, name: 'Basic White T-Shirt', category: 'casual',
      price: 399, originalPrice: 599, discount: 33, stock: 50,
      images: [IMAGES.casual[0]], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Grey'], fabric: 'Cotton',
      description: 'Premium cotton basic tee. Wardrobe essential.',
      ecoScore: 80,
      toneCompatibility: { fair: 80, light: 82, medium: 85, wheatish: 85, dusky: 88, dark: 92 },
      rating: 4.5, totalReviews: 234 },

    { shopId: fashionHub._id, name: 'Cargo Shorts', category: 'casual',
      price: 799, originalPrice: 1099, discount: 27, stock: 30,
      images: [IMAGES.casual[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Olive', 'Khaki', 'Black'], fabric: 'Cotton Twill',
      description: 'Multi-pocket cargo shorts. Perfect for weekends.',
      toneCompatibility: { fair: 68, light: 72, medium: 82, wheatish: 88, dusky: 85, dark: 80 },
      rating: 4.4, totalReviews: 89 },

    { shopId: fashionHub._id, name: 'Graphic Print Hoodie', category: 'casual',
      price: 1299, originalPrice: 1799, discount: 28, stock: 22,
      images: [IMAGES.casual[0]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Grey', 'Black', 'Navy'], fabric: 'Cotton Fleece',
      description: 'Oversized graphic hoodie. Streetwear staple.',
      toneCompatibility: { fair: 72, light: 75, medium: 80, wheatish: 82, dusky: 85, dark: 88 },
      rating: 4.6, totalReviews: 67 },

    { shopId: fashionHub._id, name: 'Linen Shorts Set', category: 'casual',
      price: 1099, originalPrice: 1499, discount: 27, stock: 18,
      images: [IMAGES.casual[1]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'White', 'Mint'], fabric: 'Linen',
      description: 'Breathable linen shorts and shirt co-ord set.',
      ecoScore: 85,
      toneCompatibility: { fair: 82, light: 80, medium: 78, wheatish: 75, dusky: 70, dark: 65 },
      rating: 4.5, totalReviews: 44 },

    { shopId: fashionHub._id, name: 'Polo T-Shirt', category: 'casual',
      price: 599, originalPrice: 849, discount: 29, stock: 38,
      images: [IMAGES.casual[0]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Navy', 'White', 'Red', 'Green'], fabric: 'Pique Cotton',
      description: 'Smart-casual polo. Works for office Fridays too.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.4, totalReviews: 112 },

    { shopId: fashionHub._id, name: 'Track Pants', category: 'casual',
      price: 699, originalPrice: 999, discount: 30, stock: 28,
      images: [IMAGES.casual[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'Grey'], fabric: 'Polyester',
      description: 'Slim-fit track pants with zip pockets.',
      toneCompatibility: { fair: 72, light: 75, medium: 80, wheatish: 82, dusky: 85, dark: 88 },
      rating: 4.3, totalReviews: 98 },

    { shopId: fashionHub._id, name: 'Summer Shorts', category: 'casual',
      price: 499, originalPrice: 699, discount: 29, stock: 32,
      images: [IMAGES.casual[0]], sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue', 'White', 'Red'], fabric: 'Cotton',
      description: 'Comfortable cotton shorts for the beach or home.',
      toneCompatibility: { fair: 70, light: 72, medium: 78, wheatish: 82, dusky: 85, dark: 88 },
      rating: 4.2, totalReviews: 76 },

    { shopId: fashionHub._id, name: 'Printed Casual Shirt', category: 'casual',
      price: 899, originalPrice: 1299, discount: 31, stock: 24,
      images: [IMAGES.casual[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Hawaiian', 'Tropical', 'Abstract'], fabric: 'Rayon',
      description: 'Relaxed-fit printed shirt. Summer holiday essential.',
      toneCompatibility: { fair: 65, light: 70, medium: 80, wheatish: 85, dusky: 88, dark: 85 },
      rating: 4.4, totalReviews: 55 },

    // ─── KIDS WORLD: KIDS (10 products) ───────────────────────
    { shopId: kidsWorld._id, name: 'Kids Denim Overalls', category: 'kids',
      price: 599, originalPrice: 869, discount: 31, stock: 20,
      images: [IMAGES.kids[0]], sizes: ['2Y', '4Y', '6Y', '8Y', '10Y'],
      colors: ['Blue', 'Light Blue'], fabric: 'Denim',
      description: 'Adorable denim overalls for toddlers and kids.',
      toneCompatibility: { fair: 80, light: 80, medium: 80, wheatish: 80, dusky: 80, dark: 80 },
      rating: 4.6, totalReviews: 78 },

    { shopId: kidsWorld._id, name: 'Ethnic Kids Kurta', category: 'kids',
      price: 499, originalPrice: 699, discount: 29, stock: 25,
      images: [IMAGES.kids[1]], sizes: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
      colors: ['Yellow', 'Blue', 'Red'], fabric: 'Cotton',
      description: 'Festive kurta for kids. Perfect for Diwali and Eid.',
      toneCompatibility: { fair: 80, light: 82, medium: 80, wheatish: 78, dusky: 75, dark: 72 },
      rating: 4.5, totalReviews: 89 },

    { shopId: kidsWorld._id, name: 'Girls Frock', category: 'kids',
      price: 699, originalPrice: 999, discount: 30, stock: 18,
      images: [IMAGES.kids[0]], sizes: ['2Y', '4Y', '6Y', '8Y', '10Y'],
      colors: ['Pink', 'Peach', 'Purple'], fabric: 'Net',
      description: 'Frilly party frock for little girls.',
      toneCompatibility: { fair: 88, light: 85, medium: 78, wheatish: 72, dusky: 68, dark: 62 },
      rating: 4.7, totalReviews: 65 },

    { shopId: kidsWorld._id, name: 'Boys Casual Set', category: 'kids',
      price: 799, originalPrice: 1099, discount: 27, stock: 22,
      images: [IMAGES.kids[1]], sizes: ['2Y', '4Y', '6Y', '8Y'],
      colors: ['Navy', 'Grey', 'Red'], fabric: 'Cotton',
      description: 'T-shirt and jogger set for active boys.',
      toneCompatibility: { fair: 75, light: 78, medium: 80, wheatish: 82, dusky: 85, dark: 88 },
      rating: 4.4, totalReviews: 54 },

    { shopId: kidsWorld._id, name: 'School Uniform Set', category: 'kids',
      price: 899, originalPrice: 1199, discount: 25, stock: 30,
      images: [IMAGES.kids[0]], sizes: ['4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
      colors: ['White + Navy'], fabric: 'Cotton Blend',
      description: 'Durable school uniform set. Shirt, pants and tie included.',
      toneCompatibility: { fair: 80, light: 80, medium: 80, wheatish: 80, dusky: 80, dark: 80 },
      rating: 4.3, totalReviews: 112 },

    { shopId: kidsWorld._id, name: 'Infant Onesie Set', category: 'kids',
      price: 399, originalPrice: 549, discount: 27, stock: 35,
      images: [IMAGES.kids[1]], sizes: ['0-3M', '3-6M', '6-12M', '12-18M'],
      colors: ['Yellow', 'White', 'Mint'], fabric: 'Organic Cotton',
      description: 'Soft organic cotton onesies. Pack of 3.',
      ecoScore: 92,
      toneCompatibility: { fair: 80, light: 80, medium: 80, wheatish: 80, dusky: 80, dark: 80 },
      rating: 4.8, totalReviews: 134 },

    { shopId: kidsWorld._id, name: 'Kids Winter Jacket', category: 'kids',
      price: 1299, originalPrice: 1799, discount: 28, stock: 15,
      images: [IMAGES.kids[0]], sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
      colors: ['Red', 'Blue', 'Black'], fabric: 'Polyester Fill',
      description: 'Warm puffer jacket for kids. Removable hood.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.6, totalReviews: 47 },

    { shopId: kidsWorld._id, name: 'Girls Lehenga Set', category: 'kids',
      price: 1499, originalPrice: 1999, discount: 25, stock: 10,
      images: [IMAGES.kids[1]], sizes: ['4Y', '6Y', '8Y', '10Y'],
      colors: ['Pink', 'Green', 'Purple'], fabric: 'Net + Silk',
      description: 'Miniature bridal lehenga for kids. Festival special.',
      toneCompatibility: { fair: 85, light: 82, medium: 78, wheatish: 72, dusky: 68, dark: 62 },
      rating: 4.8, totalReviews: 58 },

    { shopId: kidsWorld._id, name: 'Boys Formal Suit', category: 'kids',
      price: 1999, originalPrice: 2799, discount: 29, stock: 8,
      images: [IMAGES.kids[0]], sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
      colors: ['Navy', 'Black', 'Grey'], fabric: 'Polyester',
      description: 'Mini 3-piece suit for little gentlemen.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.7, totalReviews: 43 },

    { shopId: kidsWorld._id, name: 'Cotton Pyjama Set', category: 'kids',
      price: 299, originalPrice: 449, discount: 33, stock: 40,
      images: [IMAGES.kids[1]], sizes: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
      colors: ['Blue', 'Pink', 'Grey'], fabric: 'Cotton',
      description: 'Soft breathable pyjama set for comfortable sleep.',
      ecoScore: 78,
      toneCompatibility: { fair: 80, light: 80, medium: 80, wheatish: 80, dusky: 80, dark: 80 },
      rating: 4.5, totalReviews: 167 },

    // ─── FASHION HUB: MENS (8 products) ───────────────────────
    { shopId: fashionHub._id, name: 'Men\'s Linen Shirt', category: 'mens',
      price: 999, originalPrice: 1399, discount: 29, stock: 28,
      images: [IMAGES.mens[0]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Sky Blue', 'Beige'], fabric: 'Linen',
      description: 'Breathable summer linen shirt. Classic collar.',
      ecoScore: 82,
      toneCompatibility: { fair: 80, light: 82, medium: 85, wheatish: 88, dusky: 90, dark: 92 },
      rating: 4.6, totalReviews: 98 },

    { shopId: fashionHub._id, name: 'Chino Trousers', category: 'mens',
      price: 1299, originalPrice: 1799, discount: 28, stock: 24,
      images: [IMAGES.mens[1]], sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Khaki', 'Navy', 'Olive', 'Black'], fabric: 'Cotton Twill',
      description: 'Smart chino trousers. Dressed up or down.',
      toneCompatibility: { fair: 72, light: 75, medium: 80, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.5, totalReviews: 76 },

    { shopId: fashionHub._id, name: 'Denim Jeans', category: 'mens',
      price: 1799, originalPrice: 2499, discount: 28, stock: 20,
      images: [IMAGES.mens[0]], sizes: ['28', '30', '32', '34', '36'],
      colors: ['Dark Blue', 'Black', 'Grey'], fabric: 'Denim',
      description: 'Slim-fit stretch denim jeans. All-day comfort.',
      toneCompatibility: { fair: 75, light: 78, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.7, totalReviews: 142 },

    { shopId: fashionHub._id, name: 'Kurta Pyjama Set', category: 'mens',
      price: 1499, originalPrice: 2099, discount: 29, stock: 18,
      images: [IMAGES.mens[1]], sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Cream', 'Sky Blue'], fabric: 'Cotton',
      description: 'Classic kurta pyjama set for festivals.',
      toneCompatibility: { fair: 80, light: 82, medium: 85, wheatish: 88, dusky: 85, dark: 90 },
      rating: 4.5, totalReviews: 87 },

    { shopId: fashionHub._id, name: 'Bandhgala Suit', category: 'mens',
      price: 4999, originalPrice: 6999, discount: 29, stock: 8,
      images: [IMAGES.mens[0]], sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy', 'Maroon'], fabric: 'Silk Blend',
      description: 'Nehru collar bandhgala for weddings and functions.',
      toneCompatibility: { fair: 70, light: 72, medium: 82, wheatish: 88, dusky: 90, dark: 88 },
      rating: 4.8, totalReviews: 52 },

    { shopId: fashionHub._id, name: 'Half-Sleeve Shirt', category: 'mens',
      price: 699, originalPrice: 999, discount: 30, stock: 36,
      images: [IMAGES.mens[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Blue Check', 'White', 'Grey Stripes'], fabric: 'Cotton',
      description: 'Smart half-sleeve shirt. Office casual.',
      toneCompatibility: { fair: 78, light: 80, medium: 82, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.4, totalReviews: 110 },

    { shopId: fashionHub._id, name: 'Cargo Joggers', category: 'mens',
      price: 1099, originalPrice: 1499, discount: 27, stock: 26,
      images: [IMAGES.mens[0]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Olive', 'Black', 'Grey'], fabric: 'Cotton Blend',
      description: 'Streetwear cargo joggers with side pockets.',
      toneCompatibility: { fair: 68, light: 72, medium: 80, wheatish: 85, dusky: 88, dark: 90 },
      rating: 4.5, totalReviews: 63 },

    { shopId: fashionHub._id, name: 'Nehru Jacket', category: 'mens',
      price: 1799, originalPrice: 2499, discount: 28, stock: 12,
      images: [IMAGES.mens[1]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Ivory', 'Gold', 'Maroon'], fabric: 'Brocade',
      description: 'Festive Nehru jacket with brocade fabric.',
      toneCompatibility: { fair: 72, light: 75, medium: 85, wheatish: 90, dusky: 88, dark: 85 },
      rating: 4.6, totalReviews: 48 },
  ]

  // Insert all products with isSeeded flag
  const created = await Product.insertMany(products.map(p => ({ ...p, isSeeded: true })))
  console.log(`✅ Created ${created.length} products across ${[meena, fashionHub, kidsWorld].length} shops`)
  
  await mongoose.disconnect()
  console.log('Seed complete.')
}

seed().catch(console.error)
