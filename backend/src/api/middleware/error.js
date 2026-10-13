const { env } = require("../../config/vars");
const APIError = require("../utils/APIError");

exports.notFound = (req, res, next) => next(APIError.notFound(`Cannot ${req.method} ${req.originalUrl}`));

/** Central error handler: every error becomes `{ message }` with a fitting status. */
// eslint-disable-next-line no-unused-vars
exports.handler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let { message } = err;

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ") || message;
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = err.keyPattern && err.keyPattern.email ? "Email is already registered" : "Duplicate value";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  if (status >= 500) {
    if (env !== "test") console.error(err);
    if (env === "production") message = "Internal server error";
  }

  res.status(status).json({ message: message || "Internal server error" });
};
