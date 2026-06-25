import mongoose from 'mongoose';
import 'dotenv/config';

const mongoURL = process.env.MONGODB_URI;

if (!mongoURL) {
  console.error("❌ Critical Error: MONGODB_URI environment variable is completely missing!");
  process.exit(1); 
}

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
  const dbName = mongoose.connection.name;
  const envMode = process.env.NODE_ENV || 'development';
  console.log(`✅ Connected to MongoDB Server [Database: ${dbName}] [Env: ${envMode}]`);
});

db.on('error', (err) => console.error('❌ MongoDB Connection Error:', err));
db.on('disconnected', () => console.log('⚠️ MongoDB Disconnected'));

export default db;
