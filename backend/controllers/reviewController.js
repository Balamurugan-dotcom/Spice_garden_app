const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get all approved reviews (Public)
// @route   GET /api/reviews
// @access  Public
const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review (Verified Delivered Order Required)
// @route   POST /api/reviews
// @access  Private (Customer)
const submitReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating and written review feedback',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
      });
    }

    // Verify delivered order
    let verifiedOrder;
    if (orderId) {
      verifiedOrder = await Order.findOne({
        _id: orderId,
        customer: req.user._id,
        orderStatus: 'Delivered',
      });
    } else {
      // Find customer's latest delivered order if orderId wasn't passed directly
      verifiedOrder = await Order.findOne({
        customer: req.user._id,
        orderStatus: 'Delivered',
      }).sort({ createdAt: -1 });
    }

    if (!verifiedOrder) {
      return res.status(403).json({
        success: false,
        message: 'You can submit a review only after an order has been successfully Delivered.',
      });
    }

    // Check if user already reviewed this order
    const existingReview = await Review.findOne({
      customer: req.user._id,
      order: verifiedOrder._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this delivered order.',
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      customerName: req.user.name,
      order: verifiedOrder._id,
      rating: Number(rating),
      comment: comment.trim(),
      dishesLoved: Array.isArray(req.body.dishesLoved) ? req.body.dishesLoved : [],
      isApproved: false, // Requires admin approval to maintain quality
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review has been submitted for verification.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for moderation (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name email phone')
      .populate('order', 'orderId totalAmount items')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a review (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : !review.isApproved;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isApproved ? 'approved and published' : 'unapproved'}.`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an inappropriate review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await Review.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedReviews,
  submitReview,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
};
