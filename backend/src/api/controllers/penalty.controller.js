const Penalty = require("../models/penalty.model");
const APIError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const { debit, refund, recordSpend } = require("../services/credits");
const { sameId, findTeamMember } = require("../services/team");

exports.createPenalty = asyncHandler(async (req, res) => {
  const { worker, reason, cost } = req.body || {};
  const member = await findTeamMember(req.user._id, worker);
  const penalty = await Penalty.create({ worker: member._id, issuedBy: req.user._id, reason, cost });
  res.status(201).json(penalty);
});

/** Workers see their own penalties; managers see the ones they issued. */
exports.getPenalties = asyncHandler(async (req, res) => {
  const filter = req.user.role === "manager" ? { issuedBy: req.user._id } : { worker: req.user._id };
  if (req.query.status) filter.status = String(req.query.status);
  const penalties = await Penalty.find(filter)
    .sort({ createdAt: -1 })
    .populate("worker", "name email")
    .populate("issuedBy", "name email");
  res.status(200).json(penalties);
});

/** The penalised worker pays its cost in credits to clear it. */
exports.clearPenalty = asyncHandler(async (req, res) => {
  const penalty = await Penalty.findById(req.params.id);
  if (!penalty) throw APIError.notFound("Penalty not found");
  if (!sameId(penalty.worker, req.user._id)) throw APIError.forbidden("You can only clear your own penalties");
  if (penalty.status !== "active") throw APIError.conflict("Penalty is already cleared");

  await debit(req.user._id, penalty.cost);
  const cleared = await Penalty.findOneAndUpdate(
    { _id: penalty._id, status: "active" },
    { $set: { status: "cleared", clearedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!cleared) {
    await refund(req.user._id, penalty.cost);
    throw APIError.conflict("Penalty is already cleared");
  }

  await recordSpend({
    user: req.user._id,
    cost: penalty.cost,
    kind: "penalty_clear",
    ref: penalty._id,
    note: `Penalty cleared: ${penalty.reason}`,
  });
  res.status(200).json(cleared);
});
