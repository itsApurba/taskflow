const express = require("express");
const { createPenalty, getPenalties, clearPenalty } = require("../controllers/penalty.controller");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireRole("manager"), createPenalty);
router.get("/", getPenalties);
router.post("/:id/clear", requireRole("worker"), clearPenalty);

module.exports = router;
