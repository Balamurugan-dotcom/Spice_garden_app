const User = require('../models/User');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: user.cart || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync entire cart array
// @route   PUT /api/cart
// @access  Private
const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cleanItems = Array.isArray(items)
      ? items
          .filter((item) => item && (item.food || item._id))
          .map((item) => ({
            food: item.food || item._id,
            name: item.name || '',
            price: Number(item.price) || 0,
            image: item.image || '',
            category: item.category || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            quantity: Math.max(1, Number(item.quantity) || 1),
          }))
      : [];

    user.cart = cleanItems;
    await user.save();

    res.json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart or increment quantity
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { food, name, price, image, category, isVeg, quantity = 1 } = req.body;
    const foodId = String(food);

    if (!foodId) {
      return res.status(400).json({ success: false, message: 'Food item ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.food && item.food.toString() === foodId
    );

    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity += qtyToAdd;
    } else {
      user.cart.push({
        food: foodId,
        name: name || '',
        price: Number(price) || 0,
        image: image || '',
        category: category || '',
        isVeg: isVeg !== undefined ? isVeg : true,
        quantity: qtyToAdd,
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      data: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of an item
// @route   PUT /api/cart/:foodId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const { delta, quantity } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.food && item.food.toString() === String(foodId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    let newQuantity;
    if (quantity !== undefined) {
      newQuantity = Number(quantity);
    } else if (delta !== undefined) {
      newQuantity = user.cart[itemIndex].quantity + Number(delta);
    } else {
      newQuantity = user.cart[itemIndex].quantity;
    }

    if (newQuantity <= 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = newQuantity;
    }

    await user.save();

    res.json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:foodId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.cart) {
      user.cart = user.cart.filter(
        (item) => !item.food || item.food.toString() !== String(foodId)
      );
      await user.save();
    }

    res.json({
      success: true,
      data: user.cart || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
