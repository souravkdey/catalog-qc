const express = require("express");
const authenticate = require("../middleware/auth");
const { getLogs } = require("../controllers/log.controller");

const router = express.Router();

router.get("/", authenticate, getLogs);

module.exports = router;
