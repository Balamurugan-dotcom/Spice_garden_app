const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  toggleAvailability,
  deleteFood,
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getFoods);
router.get('/:id', getFoodById);

// Admin-only endpoints
router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;
