import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isReported: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent duplicate reviews per user/product/order
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { productId } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const Product = mongoose.model('Product');
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
};

// Static method to calculate average rating for a shop
reviewSchema.statics.calcShopRating = async function(shopId) {
  const result = await this.aggregate([
    { $match: { shopId } },
    { $group: { _id: '$shopId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const Shop = mongoose.model('Shop');
  if (result.length > 0) {
    await Shop.findByIdAndUpdate(shopId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].count
    });
  } else {
    await Shop.findByIdAndUpdate(shopId, { rating: 0, totalRatings: 0 });
  }
};

export default mongoose.model('Review', reviewSchema);
