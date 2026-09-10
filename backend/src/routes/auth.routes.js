const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimit.middleware");
const protect = require("../middleware/auth.middleware");
const {register, login, getProfile} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/profile", protect, getProfile);


module.exports = router;