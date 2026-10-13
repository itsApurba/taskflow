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

const STATS_ATTEMPTS = 10;

/**
 * Adds a task reward to the user's balance and XP and updates level and
 * streak in one write. The write only applies if XP and streak are still what
 * was read, so concurrent approvals for the same worker retry instead of
 * saving a level or streak computed from stale values.
 */
async function addReward(userId, reward, now) {
  for (let attempt = 0; attempt < STATS_ATTEMPTS; attempt += 1) {
    const user = await User.findById(userId).select("xp streak lastApprovedAt");
    if (!user) return;
    const xp = user.xp + reward;
    const lastApprovedAt = user.lastApprovedAt && user.lastApprovedAt > now ? user.lastApprovedAt : now;
    const result = await User.updateOne(
      { _id: userId, xp: user.xp, streak: user.streak, lastApprovedAt: user.lastApprovedAt },
      {
        $inc: { credits: reward },
        $set: { xp, level: levelForXp(xp), streak: nextStreak(user.streak, user.lastApprovedAt, now), lastApprovedAt },
      }
    );
    if (result.matchedCount === 1) return;
  }
  throw APIError.conflict("The worker's stats changed too often to update, please retry");
}

/**
 * Pays an approved task's reward to its assignee: ledger entry, balance, XP,
 * level and streak. Calling it again for the same task is a no-op. If the
 * balance update fails, the ledger entry is removed so the payment can be
 * retried.
 * @returns {Promise<boolean>} whether this call made the payment
 */
async function payTaskReward(task, now = new Date()) {
  let entry;
  try {
    entry = await CreditTransaction.create({
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

  try {
    await addReward(task.assignee, task.reward, now);
  } catch (error) {
    await CreditTransaction.deleteOne({ _id: entry._id });
    throw error;
  }
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

/** Removes a spend entry written by `recordSpend` when the rest of an operation fails. */
async function removeSpend(kind, ref) {
  await CreditTransaction.deleteOne({ kind, ref });
}

module.exports = { payTaskReward, debit, refund, recordSpend, removeSpend };
