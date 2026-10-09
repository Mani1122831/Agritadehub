import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc Add verified review for purchased product
// @route POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;

    if (!productId || !rating || !comment || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Product, rating, comment, and verified order reference are required',
      });
    }

    // Verify user actually purchased this product in the specified order!
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['delivered', 'confirmed', 'out_for_delivery'] },
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'Fake review prevented: You can only review products from your verified, completed orders.',
      });
    }

    // Check if user already reviewed this product for this order
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
      order: orderId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this order item.',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      order: orderId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true,
    });

    // Update Product average rating & review count
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: allReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review', error: error.message });
  }
};

// @desc Get reviews for a product
// @route GET /api/reviews/product/:id
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};
