const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUser,
  getManagers,
  getTeam,
} = require("../controllers/user.controller");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public: the signup form's manager picker.
router.get("/managers", getManagers);

router.use(authenticate);
router.use(require('../services/demoRestore').guardDemoMutation);

router.get("/", getUsers);
router.get("/search", searchUser);
router.get("/team", requireRole("manager"), getTeam);
router.get("/:id", getUser);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
