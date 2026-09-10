const express = require("express");
const router = express.Router();

const {
  register,
  registerRules,
  login,
  loginRules,
  getMe,
} = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Public authentication routes (protected by sliding window rate limiter)
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);

// Protected route – requires a valid JWT
router.get("/me", protect, getMe);

module.exports = router;
