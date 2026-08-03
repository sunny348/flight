import rateLimit from "express-rate-limit";

/**
 * Strict limiter for authentication endpoints (login/signup/refresh/google).
 * Blunts credential-stuffing and brute-force attempts: 10 requests per IP per
 * 15 minutes. Returns a JSON 429 consistent with our error envelope.
 */
// Disable limiting under the test runner so repeated requests don't trip 429s.
const skip = () => process.env.NODE_ENV === "test";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: {
    status: "error",
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

/**
 * Looser global limiter applied to the whole API to cap abusive traffic:
 * 300 requests per IP per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: {
    status: "error",
    message: "Too many requests. Please slow down.",
  },
});
