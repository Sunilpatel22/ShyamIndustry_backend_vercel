import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlist.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';

const router = express.Router();

router.post('/toggle', jwtAuthMiddleware, toggleWishlist);
router.get('/get', jwtAuthMiddleware, getWishlist);

export default router;