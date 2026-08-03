import razorpayInstance from "../utils/razorpay.js";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const createOrder = asyncHandler(async (req, res) => {
  // Original amount/currency from request, primarily for receipt/notes.
  const {
    amount: originalAmount,
    currency: originalCurrency = "INR",
    receipt,
    notes,
  } = req.body;

  if (!originalAmount || !receipt) {
    throw new AppError(400, "Amount and receipt are required");
  }

  // For testing purposes, override amount to 1 INR (100 paise).
  const testAmount = 100;
  const testCurrency = "INR";

  console.log(
    `Original amount: ${originalAmount} ${originalCurrency}, creating Razorpay order with test amount: ${
      testAmount / 100
    } ${testCurrency}`
  );

  const order = await razorpayInstance.orders.create({
    amount: testAmount,
    currency: testCurrency,
    receipt,
    notes,
  });

  if (!order) {
    throw new AppError(502, "Error creating Razorpay order");
  }

  res.status(201).json(order);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !bookingId
  ) {
    throw new AppError(
      400,
      "Missing required payment verification parameters or bookingId"
    );
  }

  const digest = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (digest !== razorpay_signature) {
    throw new AppError(400, "Payment verification failed: Invalid signature");
  }

  // Payment is verified — mark the booking paid and store payment references.
  const updatedBooking = await prisma.booking.update({
    where: { id: parseInt(bookingId) },
    data: {
      paymentStatus: "COMPLETED",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    },
  });

  res.status(200).json({
    message: "Payment verified successfully",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    bookingId: updatedBooking.id,
    paymentStatus: updatedBooking.paymentStatus,
  });
});
