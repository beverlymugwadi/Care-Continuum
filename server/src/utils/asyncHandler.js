/**
 * Wraps an async route/controller function so any rejected promise (or
 * thrown error) is forwarded to next(err) instead of needing a try/catch in
 * every controller. Errors then flow to the centralized error handler.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
