const CreditTransaction = require("../models/creditTransaction.model");
const asyncHandler = require("../utils/asyncHandler");

/** The signed-in user's balance and credit history, newest first. */
exports.getWallet = asyncHandler(async (req, res) => {
  const transactions = await CreditTransaction.find({ user: req.user._id }).sort({ createdAt: -1, _id: -1 });
  const earned = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum - t.amount, 0);
  res.status(200).json({ balance: req.user.credits, earned, spent, transactions });
});
