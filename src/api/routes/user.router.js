const express = require("express");
const { createUser, getUsers, getUser, updateUser, deleteUser, searchUser } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);
router.get("/search", searchUser);
router.get("/:id", getUser);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
