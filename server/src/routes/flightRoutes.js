import express from "express";
import { searchAvailableFlights } from "../controllers/flightController.js";
import validate from "../middlewares/validate.js";
import { flightSearchSchema } from "../validators/flightSchemas.js";

const router = express.Router();

// @route   GET /api/flights/search
// @desc    Search for available flights
// @access  Public (for now, booking confirmation might be protected)
router.get("/search", validate(flightSearchSchema, "query"), searchAvailableFlights);

export default router;
