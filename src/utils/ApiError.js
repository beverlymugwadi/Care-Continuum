/**
 * A deliberate, known-shape API error. Controllers throw this (or call
 * next(new ApiError(...))) for any expected failure -- validation, not
 * found, conflict, unauthorized, etc. -- and the centralized error handler
 * (src/middleware/errorHandler.js) turns it into a consistent JSON response.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Array<{ field?: string, message: string }>} [details]
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
