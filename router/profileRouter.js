import express from "express";
import { upload } from "../middleware/upload.js";
import { jwtAuthMiddleware } from "../middleware/jwtAuthMiddleware.js";
import { updateProfile, getProfile, getAvatar } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/getProfile", jwtAuthMiddleware, getProfile);

router.put(
  "/updateProfile",
  jwtAuthMiddleware,
  upload.single("profile_image"),
  updateProfile
);
router.get("/profile/avatar/:id", getAvatar);

export default router;