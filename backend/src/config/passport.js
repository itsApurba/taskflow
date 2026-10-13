const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const { jwtSecret } = require("./vars");
const User = require("../api/models/user.model");

const jwtConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
  // A provider, not secretOrKey, so a missing JWT_SECRET fails requests instead of the module load.
  secretOrKeyProvider: (req, token, done) =>
    jwtSecret ? done(null, jwtSecret) : done(new Error("JWT_SECRET is not set")),
};

const jwt = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

exports.jwt = new JwtStrategy(jwtConfig, jwt);
