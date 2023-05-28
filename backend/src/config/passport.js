const JwtStrategy = require("passport-jwt").Strategy;
const BearerStrategy = require("passport-http-bearer");
const { ExtractJwt } = require("passport-jwt");
const { jwtSecret } = require("./vars");
const User = require("../api/models/user.model");

const jwtConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
  secretOrKey: jwtSecret,
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
