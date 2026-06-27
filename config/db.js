import mongoose from 'mongoose';
import 'dotenv/config';

// Global cache object to persist connection state across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const mongoURL = process.env.MONGODB_URI;

  // 🎯 FIXED: Moved check inside the function so it doesn't crash Vercel during builds/initialization
  if (!mongoURL) {
    throw new Error("❌ Critical Error: MONGODB_URI environment variable is completely missing!");
  }

  // If a connection already exists, reuse it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Turn off buffering to surface errors instantly
    };

    cached.promise = mongoose.connect(mongoURL, opts).then((mongooseInstance) => {
      console.log(`✅ Connected to MongoDB Server [Database: ${mongooseInstance.connection.name}]`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
