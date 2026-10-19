const mongoose = require("mongoose");

const KINDS = ["task_reward", "reward_redeem", "penalty_clear"];

/**
 * Credit ledger. `amount` is signed: positive for credits earned, negative for
 * credits spent. A user's `credits` field caches the sum of their entries.
 */
const CreditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    validate: { validator: Number.isInteger, message: "amount must be an integer" },
  },
  kind: {
    type: String,
    enum: KINDS,
    required: true,
  },
  // The Task, Redemption or Penalty the entry is for.
  ref: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// One ledger entry per task, redemption or penalty, so nothing is paid or charged twice.
CreditTransactionSchema.index({ kind: 1, ref: 1 }, { unique: true });
CreditTransactionSchema.index({ user: 1, createdAt: -1 });
CreditTransactionSchema.index({ ref: 1 });

const CreditTransaction = mongoose.model("CreditTransaction", CreditTransactionSchema);
CreditTransaction.KINDS = KINDS;

module.exports = CreditTransaction;
