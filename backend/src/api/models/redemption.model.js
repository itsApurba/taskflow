const mongoose = require("mongoose");

const RedemptionSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    // Snapshot of the reward title, kept if the store item is later deleted.
    rewardTitle: { type: String, required: true },
    // The manager who stocks the reward and fulfills the redemption.
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "fulfilled"],
      default: "pending",
    },
    fulfilledAt: { type: Date },
  },
  { timestamps: true }
);

RedemptionSchema.index({ reward: 1 });
module.exports = mongoose.model("Redemption", RedemptionSchema);
