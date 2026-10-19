const mongoose = require('mongoose')

const SprintSchema = new mongoose.Schema({
  // Only the restore service sets this; legacy/global sprints remain unowned.
  demoOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    // required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    // required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

SprintSchema.pre("save", function () {
  this.updated_at = Date.now();
});

SprintSchema.index({ tasks: 1 });
const Sprint = mongoose.model("Sprint", SprintSchema);

module.exports = Sprint