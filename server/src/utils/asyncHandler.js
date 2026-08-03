/**
 * Wraps an async Express handler so any rejected promise is forwarded to
 * `next(err)` and picked up by the central error handler. Removes the need for
 * a try/catch in every controller.
 *
 * @param {Function} fn - async (req, res, next) => {...}
 * @returns {Function} Express handler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
