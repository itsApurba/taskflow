const mongoose = require("mongoose");
const User = require("../models/user.model");
const APIError = require("../utils/APIError");

/**
 * Picks the fields a new account may set. Credits, XP and the other game
 * stats always start at their defaults. A worker's `reportsTo` must be a
 * manager; managers report to no one.
 */
async function signupData(body = {}) {
  const { name, email, password } = body;
  const role = body.role || "worker";
  if (!User.ROLES.includes(role)) throw APIError.badRequest(`role must be one of: ${User.ROLES.join(", ")}`);

  let reportsTo = null;
  if (role === "worker" && body.reportsTo) {
    if (!mongoose.Types.ObjectId.isValid(body.reportsTo)) throw APIError.badRequest("reportsTo must be a manager id");
    const manager = await User.findOne({ _id: body.reportsTo, role: "manager" });
    if (!manager) throw APIError.badRequest("reportsTo must be a manager id");
    reportsTo = manager._id;
  }

  return { name, email, password, role, reportsTo };
}

module.exports = { signupData };
