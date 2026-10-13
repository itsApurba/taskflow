const User = require("../models/user.model");
const CreditTransaction = require("../models/creditTransaction.model");
const APIError = require("../utils/APIError");
const { levelForXp, nextStreak } = require("../utils/gamification");

/*
 * Local MongoDB runs standalone, so there are no multi-document transactions.
 * Balances stay non-negative because every debit is a single conditional
 * update (`credits >= cost`), and the ledger's unique (kind, ref) index means
 * a task, redemption or penalty is paid or charged at most once.
 */

const isDuplicateKey = (error) => error && error.code === 11000;

/**
 * Pays an approved task's reward to its assignee: ledger entry, balance, XP,
 * level and streak. Calling it again for the same task is a no-op.
 * @returns {Promise<boolean>} whether this call made the payment
 */
async function payTaskReward(task, now = new Date()) {
  try {
    await CreditTransaction.create({
      user: task.assignee,
      amount: task.reward,
      kind: "task_reward",
      ref: task._id,
      note: `Task approved: ${task.title}`,
      createdAt: now,
    });
  } catch (error) {
    if (isDuplicateKey(error)) return false;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    task.assignee,
    { $inc: { credits: task.reward, xp: task.reward } },
    { returnDocument: "after" }
  );
  if (!user) return true;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        level: levelForXp(user.xp),
        streak: nextStreak(user.streak, user.lastApprovedAt, now),
        lastApprovedAt: now,
      },
    }
  );
  return true;
}

/**
 * Atomically takes `cost` credits from the user, only if they have enough.
 * Throws 409 "Insufficient credits" otherwise.
 */
async function debit(userId, cost) {
  const result = await User.updateOne({ _id: userId, credits: { $gte: cost } }, { $inc: { credits: -cost } });
  if (result.matchedCount !== 1) {
    throw APIError.conflict("Insufficient credits");
  }
}

/** Gives back credits taken by `debit` when the rest of an operation fails. */
async function refund(userId, cost) {
  await User.updateOne({ _id: userId }, { $inc: { credits: cost } });
}

/** Records a spend in the ledger as a negative entry. */
async function recordSpend({ user, cost, kind, ref, note }) {
  return CreditTransaction.create({ user, amount: -cost, kind, ref, note });
}

module.exports = { payTaskReward, debit, refund, recordSpend };
