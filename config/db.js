import mongoose from 'mongoose';
import 'dotenv/config';

const mongoURL = process.env.MONGODB_URI;

if (!mongoURL) {
  console.error("❌ Critical Error: MONGODB_URI environment variable is completely missing!");
  process.exit(1); 
}

// Global cache object to persist connection state across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
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
