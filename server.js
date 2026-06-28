import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import path from 'path'; 
import connectDB from './config/db.js'; 
import userRouter from './router/userRouter.js';
import productRouter from './router/productRouter.js';
import cartRouter from './router/cartRouter.js';
import wishlistRouter from './router/wishlistRouter.js';
import profileRouter from './router/profileRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configurations
const allowedOrigins = [
  'http://localhost:5173',               
  'http://localhost:5174',               
  'https://shyamindustries.vercel.app',  // 🎯 FIXED: Corrected to match your actual live frontend domain
  process.env.CLIENT_URL                 
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by security rules (CORS mismatch)'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Dynamic serverless database connection wrapper middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ Database Connection Intercept Error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Database Connection Error", 
      details: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.send(`Hello Sunil! Running in ${process.env.NODE_ENV || 'development'} mode.`);
});

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/profile', profileRouter);

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Backend Caught Exception:", err);
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred during processing",
    error: err.message
  });
});

// Conditional port listen loops for local execution environments
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
  });
}

export default app;
