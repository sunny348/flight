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
import { authLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.js";
import {
  signupSchema,
  loginSchema,
  googleLoginSchema,
} from "../validators/authSchemas.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", authLimiter, validate(googleLoginSchema), googleLogin);
router.post("/refresh", authLimiter, refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe); // Protected route

export default router;
