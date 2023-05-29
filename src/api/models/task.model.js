const mongoose = require("mongoose");

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
    enum: ["not started", "in progress", "completed", "closed"],
    default: "not started",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

TaskSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
