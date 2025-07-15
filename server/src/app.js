  import express from "express";
  import cors from "cors";
  import cookieParser from "cookie-parser";
  import authRoutes from "./routes/authRoutes.js"; // Import auth routes
  import flightRoutes from "./routes/flightRoutes.js"; // Import flight routes
  import bookingRoutes from "./routes/bookingRoutes.js"; // Import booking routes
  import paymentRoutes from "./routes/paymentRoutes.js"; // Import payment routes
  // import bookingRoutes from './routes/bookingRoutes'; // To be added later

  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "https://flight-frontend-pi.vercel.app",
      credentials: true,
    })
  );
  app.use(express.json()); // Parses incoming requests with JSON payloads
  app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads
  app.use(cookieParser()); // Parses cookies

  // Basic Route for Testing
  app.get("/", (req, res) => {
    res.send("Flight Booking API is running!");
  });

  // API Routes
  app.use("/api/auth", authRoutes); // Use auth routes
  app.use("/api/flights", flightRoutes); // Use flight routes
  app.use("/api/bookings", bookingRoutes); // Use booking routes
  app.use("/api/payments", paymentRoutes); // Use payment routes
  // app.use('/api/bookings', bookingRoutes);

  // Error Handling Middleware (basic example, can be expanded)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  export default app;
