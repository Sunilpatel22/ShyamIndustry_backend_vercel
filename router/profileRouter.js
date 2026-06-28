import express from 'express';
import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import fs from 'fs'; // 🎯 IMPORTED native Node file system module
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware.js';

const router = express.Router();

// Define local Multer disk engine path destinations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profileImage';

    // 🎯 SELF-HEALING DIRECTORY CHECK:
    // Recursively creates the path if it is missing on disk
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, bytes) => {
      if (err) return cb(err);
      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
});

const upload = multer({ storage: storage });

// Refactored pipeline matching automatic profile instantiation logic
router.get('/getProfile', jwtAuthMiddleware, getProfile);
router.put('/updateProfile', jwtAuthMiddleware, upload.single('profile_image'), updateProfile);

export default router;
