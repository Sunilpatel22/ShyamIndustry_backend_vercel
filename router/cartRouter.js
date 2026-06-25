
import express from 'express';
import { addToCart, getCart, updateCartQuantity, removeFromCart } from '../controllers/cart.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';

const router = express.Router();

// All cart operations require a verified logged-in user session
router.post('/add', jwtAuthMiddleware, addToCart);
router.get('/get', jwtAuthMiddleware, getCart);
router.put('/update-quantity', jwtAuthMiddleware, updateCartQuantity);
router.delete('/remove/:productId', jwtAuthMiddleware, removeFromCart);

export default router;
