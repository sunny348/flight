import express from "express";
import {
  signup,
  login,
  googleLogin,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe); // Protected route

export default router;
