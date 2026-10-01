require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const statsRoutes = require('./routes/statsRoutes');
const cartRoutes = require('./routes/cartRoutes');

const Food = require('./models/Food');
const importData = require('./seeder/seeder');
const { foods } = require('./seeder/seedData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    restaurant: 'Spice Garden',
    location: 'Indiranagar, Bangalore, Karnataka, India',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and automatically seed initial data if database is fresh
const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding or syncing new dishes
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      console.log('No food items detected in database. Running initial Bangalore menu seed...');
      await importData();
    } else if (foodCount < foods.length) {
      console.log(`Syncing new menu items: current ${foodCount}, target ${foods.length}...`);
      for (const item of foods) {
        await Food.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
      const updatedCount = await Food.countDocuments();
      console.log(`✅ Menu sync complete: ${updatedCount} total dishes now available in Spice Garden.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌿 Spice Garden Backend running on http://localhost:${PORT}`);
      console.log(`🍛 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Bangalore Location: Indiranagar, 100 Feet Road`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please close the application on port ${PORT}.`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
// Connected to MongoDB Atlas Cluster
