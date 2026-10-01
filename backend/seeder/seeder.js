require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { categories, foods, users } = require('./seedData');
const connectDB = require('../config/db');

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Review.deleteMany();
    await Order.deleteMany();
    await Food.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Inserting Categories...');
    await Category.insertMany(categories);

    console.log('Inserting Users...');
    const createdUsers = [];
    for (const u of users) {
      // Must use User.create or save() to trigger bcrypt pre-save hash
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const customerUser = createdUsers.find((u) => u.role === 'customer');

    console.log('Inserting Food items...');
    await Food.insertMany(foods);

    console.log('Database Clean & Ready with 60 Real Dishes and Admin User!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during data seeding:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

module.exports = importData;

if (require.main === module) {
  importData();
}
