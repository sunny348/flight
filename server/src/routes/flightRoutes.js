import express from "express";
import { searchAvailableFlights } from "../controllers/flightController.js";
// import { protect } from '../middlewares/authMiddleware.js'; // Potentially protect booking related routes later

const router = express.Router();

// @route   GET /api/flights/search
// @desc    Search for available flights
// @access  Public (for now, booking confirmation might be protected)
router.get("/search", searchAvailableFlights);

// Example of how you might add a protected route for fetching a specific flight offer later
// router.get('/:offerId', protect, getFlightOfferDetails);

export default router;
