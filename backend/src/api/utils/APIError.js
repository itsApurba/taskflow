/**
 * Error carrying an HTTP status. The central error handler turns it into
 * `{ message }` with that status.
 */
class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }

  static badRequest(message = "Bad request") {
    return new APIError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new APIError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new APIError(message, 403);
  }

  static notFound(message = "Not found") {
    return new APIError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new APIError(message, 409);
  }
}

module.exports = APIError;
