const mongoose = require("mongoose");

// One fixed dataset, not a user-selectable reset registry.
module.exports = mongoose.model("DemoRestore", new mongoose.Schema({
  _id: { type: String, default: "taskflow-demo-v1" },
  userIds: [mongoose.Schema.Types.ObjectId],
  taskIds: mongoose.Schema.Types.Mixed,
  baselineAt: Date,
  fingerprint: String,
  lastHourlyCheck: Date,
  leaseOwner: String,
  leaseUntil: Date,
}));
