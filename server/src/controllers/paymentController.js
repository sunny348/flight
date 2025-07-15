import razorpayInstance from "../utils/razorpay.js";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    // Original amount and currency from request, primarily for receipt/notes or if not in test mode
    const {
      amount: originalAmount,
      currency: originalCurrency = "INR",
      receipt,
      notes,
    } = req.body;

    if (!originalAmount || !receipt) {
      return res
        .status(400)
        .json({ message: "Amount and receipt are required" });
    }

    // For testing purposes, override amount to 1 INR
    const testAmount = 100; // 1 INR (1 * 100 paise)
    const testCurrency = "INR";

    console.log(
      `Original amount: ${originalAmount} ${originalCurrency}, Creating Razorpay order with test amount: ${
        testAmount / 100
      } ${testCurrency}`
    );

    const options = {
      amount: testAmount,
      currency: testCurrency,
      receipt, // Use the original receipt
      notes, // Use the original notes (e.g., { bookingId: ... })
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Error creating Razorpay order" });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
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
      return res.status(400).json({
        message:
          "Missing required payment verification parameters or bookingId",
      });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Payment verification failed: Invalid signature" });
    }

    // Payment is verified, now update booking status and store payment details
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "COMPLETED",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        // You might want to store more payment details if needed
      },
    });

    // Potentially, you could also create a separate Payment record
    // await prisma.payment.create({
    //   data: {
    //     bookingId: bookingId,
    //     razorpayPaymentId: razorpay_payment_id,
    //     razorpayOrderId: razorpay_order_id,
    //     razorpaySignature: razorpay_signature,
    //     amount: updatedBooking.totalPrice, // Assuming totalPrice is on booking
    //     currency: updatedBooking.currency, // Assuming currency is on booking
    //     status: 'SUCCESS', // Or based on verification
    //   }
    // });

    res.status(200).json({
      message: "Payment verified successfully",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      bookingId: updatedBooking.id,
      paymentStatus: updatedBooking.paymentStatus,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    // If payment verification fails, you might want to update booking status to FAILED
    // For example, if bookingId was passed and booking exists:
    // if (req.body.bookingId) {
    //   await prisma.booking.update({
    //     where: { id: req.body.bookingId },
    //     data: { paymentStatus: 'FAILED' },
    //   }).catch(updateError => console.error('Error updating booking to FAILED:', updateError));
    // }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
