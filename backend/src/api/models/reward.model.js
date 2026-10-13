const mongoose = require("mongoose");

/** An item in a manager's rewards store. */
const RewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: { type: String },
    cost: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "cost must be an integer" },
    },
    // Remaining units; null means unlimited.
    stock: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: "stock must be an integer or null",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
