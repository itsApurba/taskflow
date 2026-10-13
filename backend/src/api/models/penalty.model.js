const mongoose = require("mongoose");

const PenaltySchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    // Credits the worker pays to clear the penalty.
    cost: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "cost must be an integer" },
    },
    status: {
      type: String,
      enum: ["active", "cleared"],
      default: "active",
    },
    clearedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Penalty", PenaltySchema);
