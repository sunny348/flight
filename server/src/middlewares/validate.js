/**
 * Builds an Express middleware that validates part of the request against a Zod
 * schema. On success the parsed (and coerced) value replaces the original, so
 * controllers receive clean, typed data. On failure the ZodError is forwarded
 * to the central error handler, which turns it into a 400 with field details.
 *
 * @param {import("zod").ZodTypeAny} schema
 * @param {"body"|"query"|"params"} source
 */
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    // req.query/req.params getters can be read-only on some setups; assign
    // parsed values back defensively.
    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };

export default validate;
