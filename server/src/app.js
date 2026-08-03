import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes
import flightRoutes from "./routes/flightRoutes.js"; // Import flight routes
import bookingRoutes from "./routes/bookingRoutes.js"; // Import booking routes
import paymentRoutes from "./routes/paymentRoutes.js"; // Import payment routes
import { apiLimiter } from "./middlewares/rateLimiter.js";
import errorHandler, { notFound } from "./middlewares/errorHandler.js";

const app = express();

// Security & infra middleware
app.use(helmet()); // Sets secure HTTP response headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://flight-frontend-pi.vercel.app",
    credentials: true,
  })
);
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads
app.use(cookieParser()); // Parses cookies

// Health check (used by orchestrators / uptime probes)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Basic Route for Testing
app.get("/", (req, res) => {
  res.send("Flight Booking API is running!");
});

// Global rate limiter for the API surface
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes); // Use auth routes
app.use("/api/flights", flightRoutes); // Use flight routes
app.use("/api/bookings", bookingRoutes); // Use booking routes
app.use("/api/payments", paymentRoutes); // Use payment routes

// 404 for anything unmatched, then the central error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
