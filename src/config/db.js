const mongoose = require('mongoose');
const config = require('./index');

async function connectDB() {
  if (!config.mongoUri) {
    console.error('✗ MongoDB connection failed: MONGO_URI is not set in .env');
    throw new Error('MONGO_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`✗ MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

module.exports = connectDB;
