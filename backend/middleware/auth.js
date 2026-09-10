const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware that checks the Authorization header for a valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised, no token" });
  }

  try {
    // Verify the token and decode the payload (contains { id })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user (without the password) to the request object
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorised, token invalid" });
  }
};

module.exports = { protect };
