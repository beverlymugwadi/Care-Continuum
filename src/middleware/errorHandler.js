const ApiError = require('../utils/ApiError');

/**
 * Single place that turns any error reaching next(err) into a JSON
 * response. Every error response in the app has this shape:
 *   { error: string, details?: [{ field, message }] }
 *
 * Recognizes, in order:
 *   - ApiError            -- deliberate errors thrown/passed by controllers
 *   - Mongoose ValidationError -- schema-level failures (required/enum/min/etc.)
 *   - Mongoose CastError   -- malformed ObjectId or wrong-typed value
 *   - Mongo duplicate key (E11000)
 *   - anything else        -- unexpected, logged server-side, generic 500
 */
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for '${err.path}'` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `A record with that ${field} already exists` });
  }

  // Unexpected error: log full detail server-side, don't leak it to the client.
  console.error(err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
};
