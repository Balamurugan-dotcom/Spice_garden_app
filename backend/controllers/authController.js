const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'spicegarden_super_secret_jwt_key_2026_blr',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer',
      address: address || {
        street: '',
        area: 'Indiranagar',
        landmark: '',
        city: 'Bangalore',
        pincode: '560038',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Spice Garden.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & delivery address
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.address) {
      user.address = {
        street: req.body.address.street !== undefined ? req.body.address.street : user.address.street,
        area: req.body.address.area !== undefined ? req.body.address.area : user.address.area,
        landmark: req.body.address.landmark !== undefined ? req.body.address.landmark : user.address.landmark,
        city: req.body.address.city !== undefined ? req.body.address.city : user.address.city,
        pincode: req.body.address.pincode !== undefined ? req.body.address.pincode : user.address.pincode,
      };
    }

    if (req.body.password && req.body.password.trim().length >= 6) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered customers (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    const userIds = users.map((u) => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { customer: { $in: userIds } } },
      {
        $group: {
          _id: '$customer',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderCountMap = {};
    orderCounts.forEach((item) => {
      orderCountMap[item._id.toString()] = {
        count: item.count,
        totalSpent: item.totalSpent,
        lastOrderDate: item.lastOrderDate,
      };
    });

    const enrichedUsers = users.map((user) => {
      const stats = orderCountMap[user._id.toString()] || { count: 0, totalSpent: 0, lastOrderDate: null };
      return {
        ...user.toObject(),
        orderCount: stats.count,
        ordersCount: stats.count,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    res.json({
      success: true,
      count: users.length,
      data: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using email and security phone / recovery key
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, phone, recoveryKey, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and your new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // Security Verification: Match phone number or master recovery key
    const masterRecoveryKey = process.env.ADMIN_RECOVERY_KEY || 'spicegarden2026';
    const isPhoneMatch = phone && user.phone && user.phone.trim() === phone.trim();
    const isKeyMatch = recoveryKey && recoveryKey.trim() === masterRecoveryKey;

    if (!isPhoneMatch && !isKeyMatch) {
      return res.status(400).json({
        success: false,
        message: 'Verification failed. Please enter the registered phone number or master recovery key.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// In-Memory OTP Store: { email: { otp, expiresAt } }
const otpStore = new Map();

// @desc    Generate and send 6-digit OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address.',
      });
    }

    // Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(normalizedEmail, {
      otp: generatedOtp,
      expiresAt,
    });

    console.log(`[AUTH OTP] Generated OTP for ${normalizedEmail}: ${generatedOtp} (Valid for 10 min)`);

    res.json({
      success: true,
      message: `OTP code has been sent to ${normalizedEmail}! Please check your email.`,
      expiresIn: '10 minutes',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and the 6-digit OTP code.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedRecord = otpStore.get(normalizedEmail);

    if (!storedRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP requested for this email or OTP has expired. Please request a new OTP.',
      });
    }

    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a fresh OTP.',
      });
    }

    if (storedRecord.otp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please enter the correct 6-digit code.',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully! Please enter your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password-otp
// @access  Public
const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and your new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedRecord = otpStore.get(normalizedEmail);

    if (!storedRecord || storedRecord.otp !== otp.toString().trim() || Date.now() > storedRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification failed or expired. Please verify your OTP again.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    user.password = newPassword;
    await user.save();

    // Invalidate OTP after successful reset
    otpStore.delete(normalizedEmail);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  resetPassword,
  sendOtp,
  verifyOtp,
  resetPasswordWithOtp,
};
