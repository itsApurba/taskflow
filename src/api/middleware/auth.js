const httpStatus = require("http-status");
const passport = require("passport");
const User = require("../models/user.model");

const handleJWT = (req, res, next) => async (err, user, info) => {
  console.log("here in the handle hwt");
//   const error = err || info;
//   const logIn = Promise.promisify(req.logIn);
//   const apiError = new Error({
//     message: error ? error.message : "Unauthorized",
//     status: httpStatus.UNAUTHORIZED,
//     stack: error ? error.stack : undefined,
//   });

//   try {
//     if (error || !user) throw error;
//     await logIn(user, { session: false });
//   } catch (e) {
//     return next(apiError);
//   }

  //   if (roles === LOGGED_USER) {
  //     if (user.role !== "admin" && req.params.userId !== user._id.toString()) {
  //       apiError.status = httpStatus.FORBIDDEN;
  //       apiError.message = "Forbidden";
  //       return next(apiError);
  //     }
  //   } else if (!roles.includes(user.role)) {
  //     apiError.status = httpStatus.FORBIDDEN;
  //     apiError.message = "Forbidden";
  //     return next(apiError);
  //   } else if (err || !user) {
  //     return next(apiError);
  //   }

  req.user = user;

  return next();
};

exports.authorize = (req, res, next) => passport.authenticate("jwt", { session: false }, handleJWT(req, res, next))(req, res, next);

exports.oAuth = (service) => passport.authenticate(service, { session: false });
