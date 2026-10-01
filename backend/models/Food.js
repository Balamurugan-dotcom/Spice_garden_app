const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food dish name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Starters', 'Main Course', 'Biryani', 'Chinese', 'Desserts', 'Beverages'],
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
      default: 'Medium',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
foodSchema.index({ name: 'text', description: 'text' });

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
