const express = require("express");
const { refresh, login, register } = require("../controllers/AuthControler");

const router = express.Router();

router.post('/login', login)
router.post('/register', register)
router.post('/refresh', refresh)


module.exports = router;