import express from "express";
import {
  createBooking,
  listUserBookings,
  cancelBooking,
  editBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new flight booking
// @access  Private (User must be logged in)
router.post("/", protect, createBooking);

// @route   GET /api/bookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get("/", protect, listUserBookings);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking for the logged-in user
// @access  Private
router.patch("/:id/cancel", protect, cancelBooking);

// @route   PUT /api/bookings/:id
// @desc    Edit/Relocate a booking for the logged-in user
// @access  Private
router.put("/:id", protect, editBooking);

// You can add more booking related routes here later, e.g.:
// router.get('/:bookingId', protect, getBookingDetails); // Get details of a specific booking

export default router;
