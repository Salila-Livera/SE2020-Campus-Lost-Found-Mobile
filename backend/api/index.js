// Vercel serverless entry point
// Vercel calls this file for every incoming request.
// We import the Express app (without calling app.listen) and export it
// so Vercel can wrap it in a serverless function automatically.
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const itemRoutes = require("../routes/itemRoutes");
const claimRoutes = require("../routes/claimRoutes");
const { errorHandler } = require("../middleware/errorHandler");

// Connect to MongoDB (connection is cached across warm invocations)
connectDB();

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// CORS – allow requests from any origin (Expo web + mobile)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    message: "CampusFind API running on Vercel",
    timestamp: new Date().toISOString(),
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Export for Vercel (do NOT call app.listen here)
module.exports = app;
