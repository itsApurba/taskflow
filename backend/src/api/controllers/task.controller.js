const Task = require("../models/task.model");
const APIError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const { payTaskReward } = require("../services/credits");
const { sameId, teamManagerId, teamMemberIds, teamTaskFilter } = require("../services/team");

const PERSON_FIELDS = "name email role";

/** Loads a task by `req.params.id` or throws 404. */
async function findTask(id) {
  const task = await Task.findById(id);
  if (!task) throw APIError.notFound("Task not found");
  return task;
}

/** Loads a task visible to the user's team, or throws 404. */
async function findTeamTask(id, user) {
  const task = await Task.findOne({ $and: [{ _id: id }, await teamTaskFilter(user)] });
  if (!task) throw APIError.notFound("Task not found");
  return task;
}

/**
 * Applies a lifecycle transition with a conditional update, so two concurrent
 * requests cannot both move the task out of `from`.
 */
async function transition(task, from, update, conflictMessage) {
  const updated = await Task.findOneAndUpdate({ _id: task._id, status: from }, update, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!updated) throw APIError.conflict(conflictMessage);
  return updated;
}

/** Market tasks are owned by the posting manager and only change through the lifecycle endpoints. */
const assertTaskCreator = (task, user) => {
  if (!sameId(task.createdBy, user._id)) throw APIError.forbidden("Only the manager who posted this task can do this");
};

/** Legacy tasks can only be assigned to someone in the caller's team. */
async function assertTeamAssignee(user, assignee) {
  const team = await teamMemberIds(user);
  if (!team.some((id) => sameId(id, assignee))) throw APIError.notFound("User not found in your team");
}

// ---- Market ----

exports.getMarket = asyncHandler(async (req, res) => {
  const managerId = teamManagerId(req.user);
  if (!managerId) return res.status(200).json([]);
  const tasks = await Task.find({ createdBy: managerId, status: "open" })
    .sort({ created_at: -1 })
    .populate("createdBy", PERSON_FIELDS);
  return res.status(200).json(tasks);
});

exports.createTask = asyncHandler(async (req, res) => {
  const { title, type, description, reward } = req.body || {};
  const task = await Task.create({
    title,
    type,
    description,
    reward,
    status: "open",
    createdBy: req.user._id,
  });
  res.status(201).json(task);
});

exports.claimTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  if (!task.createdBy || !sameId(task.createdBy, req.user.reportsTo)) {
    throw APIError.forbidden("You can only claim tasks from your manager's market");
  }
  const claimed = await transition(
    task,
    "open",
    { $set: { status: "in progress", assignee: req.user._id, claimedAt: new Date() } },
    "Task is not open for claiming"
  );
  res.status(200).json(claimed);
});

exports.submitTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  if (!task.createdBy) throw APIError.conflict("Only market tasks can be submitted for review");
  if (!sameId(task.assignee, req.user._id)) throw APIError.forbidden("Only the assignee can submit this task");
  const { note } = req.body || {};
  const submitted = await transition(
    task,
    "in progress",
    { $set: { status: "in review", submittedAt: new Date(), submissionNote: note } },
    "Only tasks in progress can be submitted"
  );
  res.status(200).json(submitted);
});

exports.approveTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  assertTaskCreator(task, req.user);
  const now = new Date();
  const approved = await transition(
    task,
    "in review",
    { $set: { status: "done", approvedAt: now }, $unset: { reviewNote: 1 } },
    "Task is not awaiting review"
  );
  try {
    await payTaskReward(approved, now);
  } catch (error) {
    // Put the task back in review so the manager can approve it again.
    await Task.updateOne(
      { _id: approved._id, status: "done", approvedAt: now },
      { $set: { status: "in review" }, $unset: { approvedAt: 1 } }
    );
    throw error;
  }
  res.status(200).json(approved);
});

exports.rejectTask = asyncHandler(async (req, res) => {
  const note = String((req.body && req.body.note) || "").trim();
  if (!note) throw APIError.badRequest("A note explaining what to fix is required");
  const task = await findTask(req.params.id);
  assertTaskCreator(task, req.user);
  const rejected = await transition(
    task,
    "in review",
    { $set: { status: "in progress", reviewNote: note } },
    "Task is not awaiting review"
  );
  res.status(200).json(rejected);
});

exports.getMyTasks = asyncHandler(async (req, res) => {
  const filter = req.user.role === "manager" ? { createdBy: req.user._id } : { assignee: req.user._id };
  const tasks = await Task.find(filter)
    .sort({ updated_at: -1 })
    .populate("assignee", PERSON_FIELDS)
    .populate("createdBy", PERSON_FIELDS);
  res.status(200).json(tasks);
});

exports.getReviewQueue = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user._id, status: "in review" })
    .sort({ submittedAt: 1 })
    .populate("assignee", PERSON_FIELDS);
  res.status(200).json(tasks);
});

// ---- Generic task endpoints (board and sprints), scoped to the caller's team ----

exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(await teamTaskFilter(req.user));
  res.status(200).send(tasks);
});

exports.getTask = asyncHandler(async (req, res) => {
  const task = await findTeamTask(req.params.id, req.user);
  res.status(200).send(task);
});

exports.getTaskByUser = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ $and: [{ assignee: req.params.id }, await teamTaskFilter(req.user)] });
  res.status(200).send(tasks);
});

exports.updateTask = asyncHandler(async (req, res) => {
  const { title, type, description, assignee, status, reward } = req.body || {};
  const task = await findTeamTask(req.params.id, req.user);
  let body = { title, type, description, assignee, status };
  if (task.createdBy) {
    assertTaskCreator(task, req.user);
    if (assignee !== undefined || status !== undefined) {
      throw APIError.conflict("Use the market endpoints to change a market task's status or assignee");
    }
    body = { title, type, description, reward };
  } else if (assignee !== undefined) {
    await assertTeamAssignee(req.user, assignee);
  }
  const filter = task.createdBy && reward !== undefined ? { _id: task._id, status: "open" } : { _id: task._id };
  const updated = await Task.findOneAndUpdate(filter, body, { returnDocument: "after", runValidators: true });
  if (!updated) throw APIError.conflict("The reward can only change while the task is open");
  res.status(200).send(updated);
});

exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const task = await findTeamTask(req.params.id, req.user);
  if (task.createdBy) throw APIError.conflict("Use the market endpoints to change a market task's status");
  const updated = await Task.findByIdAndUpdate(task._id, { status }, { returnDocument: "after", runValidators: true });
  res.status(200).send(updated);
});

exports.updateTaskType = asyncHandler(async (req, res) => {
  const { type } = req.body || {};
  const task = await findTeamTask(req.params.id, req.user);
  if (task.createdBy) assertTaskCreator(task, req.user);
  const updated = await Task.findByIdAndUpdate(task._id, { type }, { returnDocument: "after", runValidators: true });
  res.status(200).send(updated);
});

exports.assignTask = asyncHandler(async (req, res) => {
  const task = await findTeamTask(req.params.taskId, req.user);
  if (task.createdBy) throw APIError.conflict("Market tasks are assigned by claiming them");
  await assertTeamAssignee(req.user, req.params.id);
  const updated = await Task.findByIdAndUpdate(task._id, { assignee: req.params.id }, { returnDocument: "after" });
  res.status(200).send(updated);
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await findTeamTask(req.params.id, req.user);
  if (task.createdBy) assertTaskCreator(task, req.user);
  const { deletedCount } = await Task.deleteOne(task.createdBy ? { _id: task._id, status: "open" } : { _id: task._id });
  if (!deletedCount) throw APIError.conflict("A market task can only be deleted while it is open");
  res.status(200).send(task);
});

exports.searchTasksByName = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const tasks = await Task.find({ $and: [{ title: { $regex: name, $options: "i" } }, await teamTaskFilter(req.user)] }).limit(5);
  res.status(200).send(tasks);
});
