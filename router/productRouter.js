import express from 'express';
import { createProduct, deleteProduct, editProduct, getAllProduct } from '../controllers/product.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';
import { upload } from '../middleware/multerMiddleware.js'; // 🎯 Imported middleware

const router = express.Router();

router.post('/createProduct', jwtAuthMiddleware, upload.single('product_image'), createProduct);
router.put('/editProduct/:id', jwtAuthMiddleware, upload.single('product_image'), editProduct);
router.delete('/deleteProduct/:id', jwtAuthMiddleware, deleteProduct); 
router.get('/getAllProduct', getAllProduct);

export default router;
