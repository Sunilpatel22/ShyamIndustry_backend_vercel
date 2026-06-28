import mongoose from 'mongoose';
import 'dotenv/config';

// 🎯 GLOBAL INSTANCE CACHE: Reuses existing connection structures across serverless executions
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURL = process.env.MONGODB_URI;

  // 🎯 FIXED: Throw standard JS errors instead of calling process.exit(1) to protect Vercel cloud builds
  if (!mongoURL) {
    throw new Error("❌ Critical Error: MONGODB_URI environment variable is missing!");
  }

  // If a connection layer is already initialized, reuse it instantly
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is actively being resolved right now, wait for it instead of spinning up a duplicate
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Prevents model processing execution errors on slower warmups
    };

    cached.promise = mongoose.connect(mongoURL, opts).then((mongooseInstance) => {
      const dbName = mongooseInstance.connection.name;
      const envMode = process.env.NODE_ENV || 'development';
      console.log(`✅ Connected to MongoDB Server [Database: ${dbName}] [Env: ${envMode}]`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Resets cache to retry cleanly on future failures
    console.error('❌ MongoDB Connection Handshake Error:', error);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
