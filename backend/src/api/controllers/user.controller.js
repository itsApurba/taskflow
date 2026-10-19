const User = require("../models/user.model");
const Task = require("../models/task.model");
const Penalty = require("../models/penalty.model");
const APIError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const { signupData } = require("../services/signup");
const { teamMemberIds } = require("../services/team");

const assertSelf = (req) => {
  if (String(req.params.id) !== String(req.user._id)) throw APIError.forbidden("You can only change your own account");
};

exports.createUser = asyncHandler(async (req, res) => {
  const newUser = await User.create(await signupData(req.body));
  res.status(201).send(newUser);
});

// User reads are scoped to the caller's team (their manager and that manager's reports).

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $in: await teamMemberIds(req.user) } });
  res.status(200).send(users);
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ $and: [{ _id: req.params.id }, { _id: { $in: await teamMemberIds(req.user) } }] });
  if (!user) throw APIError.notFound("User not found");
  res.status(200).send(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  assertSelf(req);
  const { name, email } = req.body || {};
  const demoEmails = require("../services/demoFixture").ACCOUNTS.map(([, value]) => value);
  if (email !== undefined && email !== req.user.email &&
      (demoEmails.includes(req.user.email) || demoEmails.includes(email?.toLowerCase()))) {
    throw APIError.forbidden("Demo account email addresses are reserved and cannot be changed");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) throw APIError.notFound("User not found");
  res.status(200).send(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  assertSelf(req);
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw APIError.notFound("User not found");
  res.status(200).send(user);
});

exports.searchUser = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const users = await User.find({
    _id: { $in: await teamMemberIds(req.user) },
    $or: [{ name: { $regex: name, $options: "i" } }, { email: { $regex: name, $options: "i" } }],
  })
    .select("name email")
    .limit(5);
  res.status(200).send(users);
});

/** Managers for the signup picker (public). */
exports.getManagers = asyncHandler(async (req, res) => {
  const managers = await User.find({ role: "manager" }).select("name").sort({ name: 1 });
  res.status(200).json(managers.map((m) => ({ _id: m._id, name: m.name })));
});

/** The signed-in user's profile, stats and manager. */
exports.getMe = asyncHandler(async (req, res) => {
  const manager = req.user.reportsTo ? await User.findById(req.user.reportsTo).select("name email") : null;
  res.status(200).json({
    ...req.user.profile(),
    manager: manager ? { _id: manager._id, name: manager.name, email: manager.email } : null,
  });
});

/** A manager's reports with their game stats. */
exports.getTeam = asyncHandler(async (req, res) => {
  const members = await User.find({ reportsTo: req.user._id }).sort({ name: 1 });
  const ids = members.map((m) => m._id);

  const [taskCounts, penaltyCounts] = await Promise.all([
    Task.aggregate([
      { $match: { assignee: { $in: ids }, createdBy: req.user._id } },
      { $group: { _id: { assignee: "$assignee", status: "$status" }, count: { $sum: 1 } } },
    ]),
    Penalty.aggregate([
      { $match: { worker: { $in: ids }, status: "active" } },
      { $group: { _id: "$worker", count: { $sum: 1 } } },
    ]),
  ]);

  const tasksBy = {};
  taskCounts.forEach(({ _id, count }) => {
    const key = String(_id.assignee);
    tasksBy[key] = tasksBy[key] || {};
    tasksBy[key][_id.status] = count;
  });
  const penaltiesBy = Object.fromEntries(penaltyCounts.map(({ _id, count }) => [String(_id), count]));

  res.status(200).json(
    members.map((member) => {
      const tasks = tasksBy[String(member._id)] || {};
      return {
        ...member.profile(),
        tasksDone: tasks.done || 0,
        tasksInProgress: tasks["in progress"] || 0,
        tasksInReview: tasks["in review"] || 0,
        activePenalties: penaltiesBy[String(member._id)] || 0,
      };
    })
  );
});
