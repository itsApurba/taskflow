const mongoose = require("mongoose");

/**
 * Market lifecycle:
 *   open -> (claim) -> in progress -> (submit) -> in review -> (approve) -> done
 *                           ^-------------- (reject with note) ----'
 * "not started", "completed" and "closed" are legacy statuses kept valid so
 * tasks created before the market (which have no `createdBy`) still load.
 */
const MARKET_STATUSES = ["open", "in progress", "in review", "done"];
const LEGACY_STATUSES = ["not started", "completed", "closed"];

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  type: {
    type: String,
    enum: ["bug", "feature", "story"],
  },
  description: {
    type: String,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: [...MARKET_STATUSES, ...LEGACY_STATUSES],
    default: "open",
  },
  // Credits paid to the assignee when the creating manager approves the task.
  reward: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isInteger, message: "reward must be an integer" },
  },
  // The manager who posted the task to the market; unset on legacy tasks.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  submissionNote: { type: String },
  // Manager's note when sending work back.
  reviewNote: { type: String },
  claimedAt: { type: Date },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

TaskSchema.pre("save", async function () {
  this.updated_at = Date.now();
});

const Task = mongoose.model("Task", TaskSchema);
Task.MARKET_STATUSES = MARKET_STATUSES;
Task.LEGACY_STATUSES = LEGACY_STATUSES;

module.exports = Task;
