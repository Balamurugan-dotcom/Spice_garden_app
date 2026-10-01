const mongoose = require('mongoose');
const Order = require('../models/Order');
const Food = require('../models/Food');

const AVAILABLE_COUPONS = {
  BANGALORE50: {
    code: 'BANGALORE50',
    title: 'Bangalore Welcome Special',
    description: 'Flat ₹50 off on orders above ₹200',
    discountType: 'FLAT',
    discountValue: 50,
    minOrder: 200,
  },
  BIRYANI20: {
    code: 'BIRYANI20',
    title: 'Royal Dum Biryani Feast',
    description: '20% off on all Dum Biryanis (Max ₹100 off)',
    discountType: 'PERCENT_CATEGORY',
    category: 'Biryani',
    discountValue: 20,
    maxDiscount: 100,
    minOrder: 200,
  },
  FREEDEL: {
    code: 'FREEDEL',
    title: 'Free Express Bangalore Delivery',
    description: '100% Free delivery on your order',
    discountType: 'FREE_DELIVERY',
    discountValue: 40,
    minOrder: 200,
  },
};

const calculateCouponDiscount = (couponCode, subtotal, verifiedItems, initialDeliveryCharge) => {
  if (!couponCode) {
    return { valid: true, discountAmount: 0, finalDeliveryCharge: initialDeliveryCharge };
  }

  const upperCode = couponCode.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS[upperCode];

  if (!coupon) {
    return { valid: false, message: `Coupon code "${upperCode}" is invalid. Try BANGALORE50, BIRYANI20 or FREEDEL.` };
  }

  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrder}.`,
    };
  }

  let discountAmount = 0;
  let finalDeliveryCharge = initialDeliveryCharge;

  if (coupon.discountType === 'FLAT') {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'PERCENT_CATEGORY') {
    const categorySubtotal = verifiedItems
      .filter((item) => (item.category && item.category.toLowerCase() === 'biryani') || (item.name && item.name.toLowerCase().includes('biryani')))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (categorySubtotal <= 0) {
      return {
        valid: false,
        message: `Coupon "${coupon.code}" applies 20% off on Dum Biryanis. Please add a Biryani to your cart!`,
      };
    }

    const calculated = Math.round((categorySubtotal * coupon.discountValue) / 100);
    discountAmount = Math.min(calculated, coupon.maxDiscount || calculated);
  } else if (coupon.discountType === 'FREE_DELIVERY') {
    discountAmount = initialDeliveryCharge;
    finalDeliveryCharge = 0;
  }

  return {
    valid: true,
    couponCode: coupon.code,
    title: coupon.title,
    discountAmount,
    finalDeliveryCharge,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
  };
};

// @desc    Validate a promo coupon before placing order
// @route   POST /api/orders/validate-coupon
// @access  Public / Private
const validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, subtotal, items } = req.body;

    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    const initialDeliveryCharge = orderSubtotal >= 500 ? 0 : 40;
    const checkedItems = Array.isArray(items) ? items : [];

    const result = calculateCouponDiscount(couponCode, orderSubtotal, checkedItems, initialDeliveryCharge);

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order',
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.area || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full delivery address (street, area, and pincode)',
      });
    }

    // Verify item prices and availability from the database
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      let foodDoc = null;
      if (item.food && mongoose.Types.ObjectId.isValid(String(item.food))) {
        foodDoc = await Food.findById(item.food);
      }
      if (!foodDoc && item.name) {
        const dishName = String(item.name).trim();
        foodDoc = await Food.findOne({
          name: { $regex: new RegExp('^' + dishName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });
        if (!foodDoc) {
          foodDoc = await Food.findOne({
            name: { $regex: new RegExp(dishName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          });
        }
      }
      if (!foodDoc) {
        foodDoc = await Food.findOne({ isAvailable: true });
      }

      if (!foodDoc) {
        return res.status(400).json({
          success: false,
          message: `Food item "${item.name || item.food}" is no longer available`,
        });
      }

      if (!foodDoc.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${foodDoc.name}" is currently out of stock`,
        });
      }

      const qty = Number(item.quantity) || 1;
      subtotal += foodDoc.price * qty;

      verifiedItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: foodDoc.price,
        quantity: qty,
        image: foodDoc.image,
        isVeg: foodDoc.isVeg,
        category: foodDoc.category,
      });
    }

    // Validate minimum order value ₹200
    if (subtotal < 200) {
      return res.status(400).json({
        success: false,
        message: 'Minimum order value is ₹200. Please add more items.',
      });
    }

    // Delivery charge rule: ₹40 if subtotal < ₹500, free if >= ₹500
    const initialDeliveryCharge = subtotal >= 500 ? 0 : 40;

    // Apply Coupon if provided
    const couponResult = calculateCouponDiscount(
      couponCode,
      subtotal,
      verifiedItems,
      initialDeliveryCharge
    );

    if (!couponResult.valid) {
      return res.status(400).json({
        success: false,
        message: couponResult.message,
      });
    }

    const deliveryCharge = couponResult.finalDeliveryCharge;
    const discountAmount = couponResult.discountAmount || 0;
    const appliedCoupon = couponResult.couponCode || '';
    const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

    const order = await Order.create({
      customer: req.user._id,
      customerDetails: {
        name: req.user.name,
        email: req.user.email,
        phone: req.body.customerPhone || req.user.phone,
      },
      deliveryAddress: {
        street: deliveryAddress.street,
        area: deliveryAddress.area,
        landmark: deliveryAddress.landmark || '',
        city: deliveryAddress.city || 'Bangalore',
        pincode: deliveryAddress.pincode,
        instructions: deliveryAddress.instructions || '',
      },
      items: verifiedItems,
      subtotal,
      deliveryCharge,
      couponCode: appliedCoupon,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Online Payment' ? 'Paid' : 'Pending',
      orderStatus: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          note: `Order placed via ${paymentMethod || 'Cash on Delivery'}${appliedCoupon ? ` with coupon ${appliedCoupon}` : ''}`,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Spice Garden kitchen has received your order.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID (customer owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Ensure only the customer who placed the order or an admin can access it
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer can cancel ONLY while 'Order Placed')
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer or Admin)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Owner or admin check
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Check status rule
    if (order.orderStatus !== 'Order Placed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already in "${order.orderStatus}" status. Food preparation is underway.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason ? `Order cancelled: ${req.body.reason}` : 'Order cancelled by user',
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order has been successfully cancelled.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const query = Order.find(filter).sort({ createdAt: -1 });
    if (limit) {
      query.limit(Number(limit));
    }

    const orders = await query;
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const status = req.body.status || req.body.orderStatus;
    const note = req.body.note;
    const validStatuses = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed statuses: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status} by staff`,
    });

    if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
};
