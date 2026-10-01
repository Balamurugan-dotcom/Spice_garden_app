const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  isVeg: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'SG-' + Math.floor(100000 + Math.random() * 900000),
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryAddress: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      pincode: { type: String, required: true },
      instructions: { type: String, default: '' },
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [200, 'Minimum order value is ₹200'],
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash on Delivery', 'COD', 'Online Payment', 'UPI', 'Card', 'Net Banking'],
      default: 'Online Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: function () {
        return this.paymentMethod === 'Online Payment' ? 'Paid' : 'Pending';
      },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    cancelledReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if cancel is allowed
orderSchema.virtual('canCancel').get(function () {
  return this.orderStatus === 'Order Placed';
});

// Pre-save to push status history when status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Order status changed to ${this.orderStatus}`,
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
