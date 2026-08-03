/**
 * Operational error with an attached HTTP status code.
 *
 * Throw this from controllers/services for expected failures (bad input, not
 * found, forbidden, ...). The central error handler reads `statusCode` to build
 * the response. `isOperational` distinguishes these from unexpected bugs.
 */
export default class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
