const express = require("express");
const { timingSafeEqual, createHash } = require("node:crypto");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const APIError = require("../utils/APIError");
const { restoreDemo, isDemo } = require("../services/demoRestore");

const router = express.Router();
// Called hourly by the external scheduler, not by a browser or a warm-instance
// timer. No caller-supplied account, email or IDs ever enter restoration.
router.post("/hourly", asyncHandler(async (req, res) => {
  const secret = process.env.DEMO_RESTORE_SECRET;
  if (!secret) throw APIError.forbidden("Demo scheduler is not configured");
  const hash = (s) => createHash("sha256").update(s).digest();
  if (!timingSafeEqual(hash(req.get("authorization") || ""), hash(`Bearer ${secret}`))) {
    throw APIError.unauthorized();
  }
  res.set("Cache-Control", "no-store");
  res.json(await restoreDemo({ hourly: true }));
}));
router.use(authenticate);
router.get("/", (req, res) => {
  res.set("Cache-Control", "no-store").json({ canRestore: isDemo(req.user) });
});
router.post("/", asyncHandler(async (req, res) => {
  if (!isDemo(req.user)) throw APIError.forbidden("Sign in with a documented demo account to restore demo data");
  if (!req.is("application/json") || req.body?.confirm !== true || Object.keys(req.body).length !== 1) {
    throw APIError.badRequest("Confirm restoration with { confirm: true }; account selection is not supported");
  }
  res.set("Cache-Control", "no-store").json(await restoreDemo());
}));
module.exports = router;
