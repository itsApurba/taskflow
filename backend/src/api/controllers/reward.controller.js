const mongoose = require("mongoose");
const Reward = require("../models/reward.model");
const Redemption = require("../models/redemption.model");
const APIError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const { debit, refund, recordSpend, removeSpend } = require("../services/credits");
const { sameId, teamManagerId } = require("../services/team");

const pickRewardFields = (body = {}) => {
  const fields = {};
  ["title", "description", "cost", "stock", "active"].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

/** Loads a reward the signed-in manager stocks, or throws 404/403. */
async function findOwnReward(req) {
  const reward = await Reward.findById(req.params.id);
  if (!reward) throw APIError.notFound("Reward not found");
  if (!sameId(reward.createdBy, req.user._id)) throw APIError.forbidden("Only the manager who stocks this reward can do this");
  return reward;
}

/** Workers see their manager's active rewards; managers see everything they stock. */
exports.getRewards = asyncHandler(async (req, res) => {
  const managerId = teamManagerId(req.user);
  if (!managerId) return res.status(200).json([]);
  const filter = req.user.role === "manager" ? { createdBy: managerId } : { createdBy: managerId, active: true };
  const rewards = await Reward.find(filter).sort({ cost: 1, title: 1 });
  return res.status(200).json(rewards);
});

exports.createReward = asyncHandler(async (req, res) => {
  const reward = await Reward.create({ ...pickRewardFields(req.body), createdBy: req.user._id });
  res.status(201).json(reward);
});

exports.updateReward = asyncHandler(async (req, res) => {
  const reward = await findOwnReward(req);
  reward.set(pickRewardFields(req.body));
  await reward.save();
  res.status(200).json(reward);
});

exports.deleteReward = asyncHandler(async (req, res) => {
  const reward = await findOwnReward(req);
  await Reward.deleteOne({ _id: reward._id });
  res.status(200).json(reward);
});

/**
 * Buys a reward: takes one unit of stock (when limited), then the credits,
 * putting the stock back if the worker cannot afford it.
 */
exports.redeemReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);
  if (!reward || !reward.active) throw APIError.notFound("Reward not found");
  if (!sameId(reward.createdBy, req.user.reportsTo)) {
    throw APIError.forbidden("You can only redeem rewards from your manager's store");
  }

  const limited = reward.stock !== null && reward.stock !== undefined;
  if (limited) {
    const taken = await Reward.updateOne(
      { _id: reward._id, active: true, stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );
    if (taken.modifiedCount !== 1) throw APIError.conflict("This reward is out of stock");
  }

  try {
    await debit(req.user._id, reward.cost);
  } catch (error) {
    if (limited) await Reward.updateOne({ _id: reward._id }, { $inc: { stock: 1 } });
    throw error;
  }

  const redemptionId = new mongoose.Types.ObjectId();
  try {
    await recordSpend({
      user: req.user._id,
      cost: reward.cost,
      kind: "reward_redeem",
      ref: redemptionId,
      note: `Redeemed: ${reward.title}`,
    });
  } catch (error) {
    await refund(req.user._id, reward.cost);
    if (limited) await Reward.updateOne({ _id: reward._id }, { $inc: { stock: 1 } });
    throw error;
  }

  let redemption;
  try {
    redemption = await Redemption.create({
      _id: redemptionId,
      worker: req.user._id,
      reward: reward._id,
      rewardTitle: reward.title,
      manager: reward.createdBy,
      cost: reward.cost,
    });
  } catch (error) {
    await removeSpend("reward_redeem", redemptionId);
    await refund(req.user._id, reward.cost);
    if (limited) await Reward.updateOne({ _id: reward._id }, { $inc: { stock: 1 } });
    throw error;
  }
  res.status(201).json(redemption);
});

/** Workers see their own redemptions; managers see their team's. */
exports.getRedemptions = asyncHandler(async (req, res) => {
  const filter = req.user.role === "manager" ? { manager: req.user._id } : { worker: req.user._id };
  const redemptions = await Redemption.find(filter)
    .sort({ createdAt: -1 })
    .populate("worker", "name email")
    .populate("reward", "title cost");
  res.status(200).json(redemptions);
});

exports.fulfillRedemption = asyncHandler(async (req, res) => {
  const redemption = await Redemption.findById(req.params.id);
  if (!redemption) throw APIError.notFound("Redemption not found");
  if (!sameId(redemption.manager, req.user._id)) {
    throw APIError.forbidden("Only the manager who stocks this reward can fulfill it");
  }
  const fulfilled = await Redemption.findOneAndUpdate(
    { _id: redemption._id, status: "pending" },
    { $set: { status: "fulfilled", fulfilledAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!fulfilled) throw APIError.conflict("Redemption is already fulfilled");
  res.status(200).json(fulfilled);
});
