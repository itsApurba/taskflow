const mongoose = require("mongoose");
const User = require("../models/user.model");
const APIError = require("../utils/APIError");

/** Returns the ObjectId behind a value that may be a populated document. */
const idOf = (value) => (value && value._id ? value._id : value);

const sameId = (a, b) => Boolean(a && b) && String(idOf(a)) === String(idOf(b));

/**
 * The manager whose market, store and leaderboard the user sees: managers see
 * their own, workers see the one they report to (null if they have none).
 */
const teamManagerId = (user) => (user.role === "manager" ? user._id : user.reportsTo || null);

/** Loads a member of the manager's team, or throws 400/404. */
async function findTeamMember(managerId, userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw APIError.badRequest("A valid worker id is required");
  const member = await User.findOne({ _id: userId, reportsTo: managerId });
  if (!member) throw APIError.notFound("Worker not found in your team");
  return member;
}

module.exports = { idOf, sameId, teamManagerId, findTeamMember };
