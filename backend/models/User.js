const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your 10-digit phone number'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    address: {
      street: { type: String, default: '' },
      area: { type: String, default: 'Indiranagar' },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      pincode: { type: String, default: '560038' },
    },
    cart: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        name: { type: String, default: '' },
        price: { type: Number, default: 0 },
        image: { type: String, default: '' },
        category: { type: String, default: '' },
        isVeg: { type: Boolean, default: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
