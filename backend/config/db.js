const mongoose = require("mongoose");

// Connect to MongoDB Atlas using the URI in .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      family: 4, // Force IPv4 to bypass common IPv6 SRV resolution failures
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit the process so the server doesn't run without a database
    process.exit(1);
  }
};

module.exports = connectDB;
