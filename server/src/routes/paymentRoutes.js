import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Assuming you have auth middleware

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private (user must be logged in)
router.post("/create-order", protect, createOrder);

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment and update booking
// @access  Private
router.post("/verify-payment", protect, verifyPayment);

export default router;
