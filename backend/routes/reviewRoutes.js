const express = require('express');
const router = express.Router();
const {
  getApprovedReviews,
  submitReview,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getApprovedReviews);
router.post('/', protect, submitReview);

// Admin-only review management
router.get('/admin', protect, adminOnly, getAllReviewsAdmin);
router.put('/:id/approve', protect, adminOnly, toggleReviewApproval);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
