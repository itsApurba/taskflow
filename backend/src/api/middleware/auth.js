const passport = require("passport");
const APIError = require("../utils/APIError");

/** Requires a valid `Authorization: Bearer <jwt>` header and sets `req.user`. */
const authenticate = (req, res, next) =>
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(APIError.unauthorized());
    req.user = user;
    return next();
  })(req, res, next);

/** Allows only users with one of `roles`; everyone else gets 403. */
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    return next(APIError.forbidden(`Only ${roles.join(" or ")}s can do this`));
  };

exports.authenticate = authenticate;
exports.authorize = authenticate;
exports.requireRole = requireRole;
exports.oAuth = (service) => passport.authenticate(service, { session: false });
