import express from 'express';
import { getAllUser,  getMe,  registerNewAccount,  signin,  signup } from '../controllers/userController.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';


const router= express.Router()

router.post('/signup',signup)
router.post('/login',signin)
router.get('/getAllUser',getAllUser)
router.post("/create", registerNewAccount);
router.get('/me', jwtAuthMiddleware, getMe); 
export default router;