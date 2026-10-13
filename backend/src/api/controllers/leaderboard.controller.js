const User = require("../models/user.model");
const Task = require("../models/task.model");
const CreditTransaction = require("../models/creditTransaction.model");
const APIError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const { currentStreak } = require("../utils/gamification");
const { teamManagerId } = require("../services/team");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ranks the team by credits earned from approved tasks: all time (equal to XP)
 * or over the last 7 days.
 */
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const period = req.query.period || "all";
  if (!["week", "all"].includes(period)) throw APIError.badRequest("period must be week or all");

  const managerId = teamManagerId(req.user);
  if (!managerId) return res.status(200).json({ period, entries: [] });

  const members = await User.find({ reportsTo: managerId });
  const ids = members.map((m) => m._id);
  const since = period === "week" ? new Date(Date.now() - WEEK_MS) : null;

  const earnedMatch = { user: { $in: ids }, kind: "task_reward" };
  const doneMatch = { assignee: { $in: ids }, createdBy: managerId, status: "done" };
  if (since) {
    earnedMatch.createdAt = { $gte: since };
    doneMatch.approvedAt = { $gte: since };
  }

  const [earned, done] = await Promise.all([
    CreditTransaction.aggregate([{ $match: earnedMatch }, { $group: { _id: "$user", points: { $sum: "$amount" } } }]),
    Task.aggregate([{ $match: doneMatch }, { $group: { _id: "$assignee", count: { $sum: 1 } } }]),
  ]);
  const pointsBy = Object.fromEntries(earned.map(({ _id, points }) => [String(_id), points]));
  const doneBy = Object.fromEntries(done.map(({ _id, count }) => [String(_id), count]));

  const entries = members
    .map((member) => ({
      user: { _id: member._id, name: member.name },
      points: pointsBy[String(member._id)] || 0,
      tasksDone: doneBy[String(member._id)] || 0,
      xp: member.xp,
      level: member.level,
      streak: currentStreak(member.streak, member.lastApprovedAt),
    }))
    .sort((a, b) => b.points - a.points || b.xp - a.xp || a.user.name.localeCompare(b.user.name))
    .map((entry, index) => ({ rank: index + 1, ...entry }));

  return res.status(200).json({ period, entries });
});
