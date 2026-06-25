import express from 'express';
import crypto from 'crypto';
import path from 'path';
import multer from 'multer'; // 🎯 FIX 1: Ensure Multer is imported!
import { createProduct, deleteProduct, editProduct, getAllProduct } from '../controllers/product.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 🎯 NOTE: Ensure an 'uploads' folder exists in your project root directory.
    // Using './uploads' keeps it locally within your project folder tree safely.
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // 🎯 FIX 2: Generate random bytes synchronously, or place the callback INSIDE to avoid scoping crashes
    crypto.randomBytes(12, (err, bytes) => {
      if (err) return cb(err);
      
      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn); // Callback executed inside the block where 'fn' exists
    });
  }
});

const upload = multer({ storage: storage });

// 🎯 FIX 3: Changed 'uploaded_file' to 'product_image' to match your React component!
router.post('/createProduct', upload.single('product_image'), createProduct);
router.put('/editProduct/:id', upload.single('product_image'), editProduct);
router.delete('/deleteProduct/:id', deleteProduct); 
router.get('/getAllProduct', getAllProduct);

export default router;
