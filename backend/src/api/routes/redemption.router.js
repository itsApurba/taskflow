const express = require("express");
const { getRedemptions, fulfillRedemption } = require("../controllers/reward.controller");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", getRedemptions);
router.post("/:id/fulfill", requireRole("manager"), fulfillRedemption);

module.exports = router;
