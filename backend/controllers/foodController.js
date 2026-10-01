const Food = require('../models/Food');
const Category = require('../models/Category');

// @desc    Get all foods with search, category and veg filters
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const { category, search, isVeg, isAvailable, popular } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    if (popular !== undefined && popular !== '') {
      query.isPopular = popular === 'true';
    }

    const foods = await Food.find(query).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food item by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }
    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/foods/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: 1 });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isAvailable, isVeg, spiceLevel, isPopular } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category, and image URL',
      });
    }

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVeg: Boolean(isVeg),
      spiceLevel: spiceLevel || 'Medium',
      isPopular: Boolean(isPopular),
    });

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    const { name, description, price, category, image, isAvailable, isVeg, spiceLevel, isPopular } = req.body;

    if (name) food.name = name;
    if (description) food.description = description;
    if (price !== undefined) food.price = Number(price);
    if (category) food.category = category;
    if (image) food.image = image;
    if (isAvailable !== undefined) food.isAvailable = Boolean(isAvailable);
    if (isVeg !== undefined) food.isVeg = Boolean(isVeg);
    if (spiceLevel) food.spiceLevel = spiceLevel;
    if (isPopular !== undefined) food.isPopular = Boolean(isPopular);

    const updatedFood = await food.save();

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle food availability (In Stock / Out of Stock)
// @route   PATCH /api/foods/:id/availability
// @access  Private/Admin
const toggleAvailability = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    food.isAvailable = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !food.isAvailable;
    await food.save();

    res.json({
      success: true,
      message: `Dish availability updated to ${food.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    await Food.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  toggleAvailability,
  deleteFood,
};
