import mongoose from 'mongoose';
import { seedDatabase } from '../utils/seedData.js';
import Product from '../models/Product.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);

    // Auto-seed if database is empty
    const count = await Product.countDocuments();
    if (count < 22) {
      console.log(`[Auto-Seed] Initializing 22 products and seed data into MongoDB Atlas...`);
      await seedDatabase();
    }
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Notice]: ${error.message}`);
    console.log(`To connect to MongoDB Atlas from this machine, ensure Network Access in MongoDB Atlas has 0.0.0.0/0 enabled.`);
  }
};

export default connectDB;
