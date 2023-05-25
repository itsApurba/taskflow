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
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
