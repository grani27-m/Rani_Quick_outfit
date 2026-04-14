import mongoose from 'mongoose';
import User from './models/User.js';
import Shop from './models/Shop.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create demo users
    const demoAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@quickoutfit.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      avatar: '👨‍💼'
    });

    const demoShopkeeper = await User.create({
      name: 'Priya Sharma',
      email: 'priya@boutique.com',
      phone: '9876543211',
      password: 'shop123',
      role: 'shopkeeper',
      avatar: '👩‍🌾'
    });

    const demoCustomer = await User.create({
      name: 'Raj Kumar',
      email: 'raj@gmail.com',
      phone: '9876543212',
      password: 'cust123',
      role: 'customer',
      avatar: '👨‍💼',
      skinTone: 'medium',
      loyaltyPoints: 250
    });

    const demoDelivery = await User.create({
      name: 'Ramesh Singh',
      email: 'delivery@demo.com',
      phone: '9876543213',
      password: 'delivery123',
      role: 'delivery',
      avatar: '🛵'
    });

    console.log('✅ Users created');

    // Create categories
    const categories = await Category.create([
      { name: 'Saree', description: 'Traditional Indian sarees', isActive: true },
      { name: 'Kurta', description: 'Kurtas and kurta sets', isActive: true },
      { name: 'Western', description: 'Dresses, tops, and western wear', isActive: true },
      { name: 'Ethnic', description: 'Ethnic and festive wear', isActive: true },
      { name: 'Casual', description: 'Casual and everyday wear', isActive: true },
      { name: 'Formal', description: 'Formal and office wear', isActive: true },
      { name: 'Kids', description: 'Kids fashion', isActive: true },
      { name: 'Mens', description: 'Mens wear', isActive: true }
    ]);

    console.log('✅ Categories created');

    // Create shops
    const shops = await Shop.create([
      {
        ownerId: demoShopkeeper._id,
        name: 'Meena Boutique',
        description: 'Premium sarees and ethnic wear',
        category: 'saree',
        location: { type: 'Point', coordinates: [77.209, 28.5244] },
        address: 'MG Road, Chandni Chowk, Delhi',
        phone: '9876543211',
        rating: 4.8,
        reviewCount: 324,
        approved: true,
        verificationStatus: 'verified',
        isLive: false
      },
      {
        ownerId: demoShopkeeper._id,
        name: 'Fashion Hub',
        description: 'Modern western and casual wear',
        category: 'western',
        location: { type: 'Point', coordinates: [77.215, 28.5320] },
        address: 'Sarojini Nagar Market, Delhi',
        phone: '9876543211',
        rating: 4.5,
        reviewCount: 189,
        approved: true,
        verificationStatus: 'verified',
        isLive: false
      }
    ]);

    console.log('✅ Shops created');

    // Create products
    const products = await Product.create([
      {
        shopId: shops[0]._id,
        name: 'Premium Silk Saree',
        description: 'Beautiful Banarasi silk saree with golden zari work',
        price: 3499,
        originalPrice: 4999,
        category: 'saree',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d619b2?auto=format&fit=crop&q=80&w=600'],
        colours: ['Red', 'Green', 'Blue'],
        sizes: ['Free Size'],
        fabricType: 'silk',
        ecoScore: 78,
        toneCompatibility: { fair: 90, light: 85, medium: 88, wheatish: 92, dusky: 95, dark: 93 },
        stock: 8,
        rating: 4.8,
        reviewCount: 156,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[0]._id,
        name: 'Festive Anarkali Set',
        description: 'Beautiful red Anarkali set perfect for festive occasions',
        price: 1499,
        originalPrice: 2199,
        category: 'ethnic',
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'],
        colours: ['Red', 'Maroon', 'Gold'],
        sizes: ['S', 'M', 'L', 'XL'],
        fabricType: 'silk',
        ecoScore: 85,
        toneCompatibility: { fair: 92, light: 88, medium: 95, wheatish: 90, dusky: 85, dark: 82 },
        stock: 15,
        rating: 4.8,
        reviewCount: 67,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[1]._id,
        name: 'Cotton Crop Top & Jeans',
        description: 'Trendy cotton crop top paired with high-waist jeans',
        price: 899,
        originalPrice: 1299,
        category: 'western',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600'],
        colours: ['White', 'Blue', 'Pink'],
        sizes: ['XS', 'S', 'M', 'L'],
        fabricType: 'cotton',
        ecoScore: 92,
        toneCompatibility: { fair: 85, light: 90, medium: 88, wheatish: 82, dusky: 95, dark: 93 },
        stock: 30,
        rating: 4.5,
        reviewCount: 43,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[0]._id,
        name: 'Embroidered Silk Kurta',
        description: 'Hand-embroidered silk kurta for men, perfect for weddings',
        price: 1899,
        originalPrice: 2599,
        category: 'kurta',
        images: ['https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=600'],
        colours: ['Yellow', 'White'],
        sizes: ['M', 'L', 'XL'],
        fabricType: 'silk',
        stock: 25,
        rating: 4.7,
        reviewCount: 89,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[1]._id,
        name: 'Slim Fit Formal Blazer',
        description: 'Classic navy blue slim fit blazer for office and formal events',
        price: 2999,
        originalPrice: 4599,
        category: 'formal',
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'],
        colours: ['Navy Blue', 'Black'],
        sizes: ['S', 'M', 'L', 'XL'],
        fabricType: 'linen',
        stock: 12,
        rating: 4.9,
        reviewCount: 201,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[1]._id,
        name: 'Casual V-Neck T-Shirt',
        description: 'Everyday comfortable cotton v-neck t-shirt',
        price: 499,
        originalPrice: 799,
        category: 'casual',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600'],
        colours: ['White', 'Olive', 'Grey'],
        sizes: ['S', 'M', 'L', 'XL'],
        fabricType: 'cotton',
        stock: 50,
        rating: 4.3,
        reviewCount: 112,
        isFeatured: false,
        isActive: true
      },
      {
        shopId: shops[1]._id,
        name: 'Kids Denim Overalls',
        description: 'Cute and durable denim overalls for toddlers and kids',
        price: 899,
        originalPrice: 1299,
        category: 'kids',
        images: ['https://images.unsplash.com/photo-1519238396085-dc46bf4fc83a?auto=format&fit=crop&q=80&w=600'],
        colours: ['Blue Denim'],
        sizes: ['2Y', '4Y', '6Y'],
        fabricType: 'cotton',
        stock: 18,
        rating: 4.6,
        reviewCount: 34,
        isFeatured: true,
        isActive: true
      },
      {
        shopId: shops[1]._id,
        name: 'Mens Casual Shirt',
        description: 'Checkered casual shirt for men',
        price: 999,
        originalPrice: 1599,
        category: 'mens',
        images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600'],
        colours: ['Red/Black', 'Blue/White'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        fabricType: 'cotton',
        stock: 22,
        rating: 4.4,
        reviewCount: 56,
        isFeatured: false,
        isActive: true
      }
    ]);

    console.log('✅ Products created');

    mongoose.connection.close();
    console.log('✅ Seed data populated successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
