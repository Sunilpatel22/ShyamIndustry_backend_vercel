import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import path from 'path'; 
import fs from 'fs'; 
// 🎯 CHANGED: Import the database connection function instead of a static object
import connectDB from './config/db.js'; 
import userRouter from './router/userRouter.js';
import productRouter from './router/productRouter.js';
import cartRouter from './router/cartRouter.js';
import wishlistRouter from './router/wishlistRouter.js';
import profileRouter from './router/profileRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS based on loaded environment file
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// 🎯 Safe local static folder loading (only attaches if the directory exists)
const uploadsPath = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
}

// 🎯 ADDED: Middleware to ensure MongoDB is connected before processing ANY request on Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ 
      error: "Database Connection Error", 
      details: process.env.NODE_ENV !== 'production' ? err.message : "Could not connect to database backend"
    });
  }
});

app.get('/', (req, res) => {
  res.send(`Hello Sunil! Running in ${process.env.NODE_ENV || 'production'} mode.`);
});

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/profile', profileRouter);

// 🎯 Conditional listen: Avoids locking port issues during Vercel builds
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
  });
}

// 🎯 CRITICAL FOR VERCEL: Export the application instance
export default app;
