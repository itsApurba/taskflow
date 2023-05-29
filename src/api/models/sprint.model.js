const mongoose = require('mongoose')

const SprintSchema = new mongoose.Schema({
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

SprintSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Sprint = mongoose.model("Sprint", SprintSchema);

module.exports = Sprint