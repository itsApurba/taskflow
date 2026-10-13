const express = require("express");
const {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
} = require("../controllers/reward.controller");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", getRewards);
router.post("/", requireRole("manager"), createReward);
router.patch("/:id", requireRole("manager"), updateReward);
router.delete("/:id", requireRole("manager"), deleteReward);
router.post("/:id/redeem", requireRole("worker"), redeemReward);

module.exports = router;
