const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ── Helper: JWT signing utility ──────────────────────────────────────────────
const signToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in backend environment");
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Comprehensive Advanced Validation Rules ───────────────────────────────────
const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s.'-]+$/)
    .withMessage("Name can only contain alphabetic letters, spaces, dots, and hyphens")
    .custom((val) => {
      const letters = val.replace(/[^A-Za-z]/g, "");
      if (letters.length < 2) {
        throw new Error("Name must contain at least 2 alphabet letters");
      }
      return true;
    }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Email must be between 5 and 100 characters")
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please enter a valid email address with a valid domain (e.g. user@university.edu)")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number")
    .custom((val) => {
      const commonWeak = ["123456", "password", "password123", "qwerty", "admin123", "letmein1"];
      if (commonWeak.includes(val.toLowerCase())) {
        throw new Error("This password is too easily guessed. Please choose a stronger password.");
      }
      return true;
    }),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!/^[+]?[\d\s\-().]+$/.test(val)) {
        throw new Error("Phone number contains invalid characters");
      }
      const digits = val.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) {
        throw new Error("Phone number must contain between 9 and 15 digits");
      }
      if (/^(\d)\1+$/.test(digits)) {
        throw new Error("Please enter a valid, non-repeating phone number");
      }
      return true;
    }),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please enter a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password exceeds maximum allowed length"),
];

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists (case-insensitive)
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please sign in instead.",
        fields: { email: "This email is already registered" },
      });
    }

    // Create the user – pre-save hook in User model hashes password
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : undefined,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly request password since select: false is on schema
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    // Timing-safe comparison: if user not found, perform dummy hash to mitigate enumeration
    if (!user) {
      await bcrypt.compare(password, "$2a$10$abcdefghijklmnopqrstuuNOPQRSTUVWXYZ123456789012345678");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me (protected) ─────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
    },
  });
};

module.exports = { register, registerRules, login, loginRules, getMe };
