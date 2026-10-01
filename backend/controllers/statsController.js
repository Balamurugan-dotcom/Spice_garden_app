const Order = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get admin dashboard metrics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Today's orders count
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // Orders by status
    const [placedCount, preparingCount, outCount, deliveredCount, cancelledCount] = await Promise.all([
      Order.countDocuments({ orderStatus: 'Order Placed' }),
      Order.countDocuments({ orderStatus: 'Preparing' }),
      Order.countDocuments({ orderStatus: 'Out for Delivery' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
    ]);

    // Pending orders (active: Order Placed, Preparing, or Out for Delivery)
    const pendingOrders = placedCount + preparingCount + outCount;

    // Total sales (excluding cancelled orders)
    const totalSalesAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = totalSalesAgg.length > 0 ? totalSalesAgg[0].total : 0;

    // Today's sales (excluding cancelled orders)
    const todaySalesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].total : 0;

    // Count dishes and customers
    const totalDishes = await Food.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Category breakdown
    const categoryBreakdown = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top-selling dishes aggregation
    const topSellingDishes = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          image: { $first: '$items.image' },
          isVeg: { $first: '$items.isVeg' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 },
    ]);

    // Pending reviews needing moderation
    const pendingReviews = await Review.countDocuments({ isApproved: false });

    // Recent orders (last 8)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        todayOrders,
        totalOrders,
        todaySales,
        totalSales,
        totalRevenue: totalSales,
        pendingOrders: placedCount,
        preparingOrders: preparingCount,
        outForDeliveryOrders: outCount,
        deliveredOrders: deliveredCount,
        cancelledOrders: cancelledCount,
        ordersByStatus: {
          placed: placedCount,
          preparing: preparingCount,
          outForDelivery: outCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
        },
        totalDishes,
        totalFoods: totalDishes,
        totalCustomers,
        averageOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
        fulfillmentRate: totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 100,
        topSellingDishes,
        pendingReviews,
        categoryBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
