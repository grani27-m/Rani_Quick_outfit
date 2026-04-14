import mongoose from 'mongoose';
import User from './models/User.js';
import Shop from './models/Shop.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const generateReport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for reporting...');

    const users = await User.find({}).lean();
    const shops = await Shop.find({}).lean();
    const products = await Product.find({}).populate('shopId').lean();
    const categories = await Category.find({}).lean();
    const orders = await Order.find({}).lean();
    const reviews = await Review.find({}).lean();

    let report = `# QuickOutfit Database Full Report\n\n`;
    report += `Generated at: ${new Date().toISOString()}\n\n`;

    report += `## 1. System Users (${users.length} Total)\n| Role | Name | Email | Phone | Details |\n|---|---|---|---|---|\n`;
    users.forEach(u => {
      let details = `Tone: ${u.skinTone || 'N/A'}`;
      if(u.loyaltyPoints) details += `, Pts: ${u.loyaltyPoints}`;
      report += `| ${u.role} | ${u.name} | ${u.email} | ${u.phone} | ${details} |\n`;
    });

    report += `\n## 2. Platform Shops (${shops.length} Total)\n| Name | Category | Rating/Reviews | Status | Address |\n|---|---|---|---|---|\n`;
    shops.forEach(s => {
      report += `| ${s.name} | ${s.category} | ${s.rating} (${s.reviewCount}) | ${s.verificationStatus} | ${s.address} |\n`;
    });

    report += `\n## 3. Platform Inventory (${products.length} Total)\n| Product Name | Shop | Category | Price | EcoScore | Stock |\n|---|---|---|---|---|---|\n`;
    products.forEach(p => {
      const sName = p.shopId && p.shopId.name ? p.shopId.name : 'Unknown';
      report += `| ${p.name} | ${sName} | ${p.category} | ₹${p.price} | ${p.ecoScore} | ${p.stock} |\n`;
    });

    report += `\n## 4. Categories (${categories.length} Total)\n| Name | Active | Description |\n|---|---|---|\n`;
    categories.forEach(c => {
      report += `| ${c.name} | ${c.isActive} | ${c.description} |\n`;
    });
    
    report += `\n## 5. Orders (${orders.length} Total)\n`;
    if(orders.length === 0) report += `*No orders currently exist in the database.*\n`;

    report += `\n## 6. Reviews (${reviews.length} Total)\n`;
    if(reviews.length === 0) report += `*No reviews currently exist in the database.*\n`;

    const outPath = "C:/Users/CHARLESJK/.gemini/antigravity/brain/9ee74b79-8870-4b4f-b42e-8b99ccc1a719/db_report.md";
    fs.writeFileSync(outPath, report);

    console.log('✅ Report generated successfully at:', outPath);
    process.exit(0);
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
};

generateReport();
