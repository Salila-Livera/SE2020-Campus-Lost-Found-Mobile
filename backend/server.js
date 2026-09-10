require("dotenv").config(); // load .env variables before anything else
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");
const { errorHandler } = require("./middleware/errorHandler");

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// CORS configuration - supports web and mobile clients
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming JSON and urlencoded bodies with safe size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health-check route – useful to confirm the server is up on Render
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    message: "CampusFind API running",
    timestamp: new Date().toISOString(),
  })
);

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Must be registered AFTER all routes – catches errors passed via next(error)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
);

// Graceful shutdown
const handleShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
