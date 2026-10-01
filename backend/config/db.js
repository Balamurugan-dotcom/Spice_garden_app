const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spice_garden';
  
  try {
    console.log(`Connecting to real MongoDB database at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Real MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.error('Please make sure your MongoDB server is running or configure MONGODB_URI in backend/.env.');
    process.exit(1);
  }
};

module.exports = connectDB;
