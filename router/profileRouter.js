import express from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';
import { upload } from '../middleware/multerMiddleware.js'; // 🎯 Imported middleware

const router = express.Router();

router.get('/getProfile', jwtAuthMiddleware, getProfile);
router.put('/updateProfile', jwtAuthMiddleware, upload.single('profile_image'), updateProfile);

export default router;
