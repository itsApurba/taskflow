/**
 * Wraps an async route handler so rejected promises reach `next`
 * (Express 4 does not do this on its own; Express 5 does).
 */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
