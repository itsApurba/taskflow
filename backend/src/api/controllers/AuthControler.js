const RefreshToken = require("../models/refreshToken.model");
const moment = require("moment-timezone");
const { jwtExpirationInterval } = require("../../config/vars");
const User = require("../models/user.model");
const { signupData } = require("../services/signup");

async function generateTokenResponse(user, accessToken) {
  const tokenType = "Bearer";
  const { token: refreshToken } = await RefreshToken.generate(user);
  const expiresIn = moment().add(jwtExpirationInterval, "minutes");
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

exports.register = async (req, res, next) => {
  try {
    const userData = await signupData(req.body);
    const user = await new User(userData).save();
    const token = await generateTokenResponse(user, user.token());
    res.status(201);
    return res.json({ token, user });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body || {});
    const token = await generateTokenResponse(user, accessToken);
    return res.json({ token, user });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body || {};
    const refreshObject = await RefreshToken.findOneAndDelete({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = await generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};