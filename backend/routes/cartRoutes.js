const express = require('express');
const router = express.Router();
const {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes are scoped to the authenticated candidate/user
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(syncCart)
  .delete(clearCart);

router.route('/:foodId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
