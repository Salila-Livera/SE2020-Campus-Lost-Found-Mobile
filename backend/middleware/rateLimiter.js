/**
 * Production-ready in-memory sliding window rate limiter
 * Protects login and registration routes against brute-force attacks.
 */
const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 10; // 10 attempts per window
  const message = options.message || "Too many attempts from this IP. Please try again later.";

  const hits = new Map();

  // Periodic cleanup of stale entries every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const validTimestamps = timestamps.filter((time) => now - time < windowMs);
      if (validTimestamps.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const timestamps = hits.get(ip) || [];
    const recentTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (recentTimestamps.length >= max) {
      const oldestHit = recentTimestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestHit)) / 1000);

      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    recentTimestamps.push(now);
    hits.set(ip, recentTimestamps);
    next();
  };
};

// Strict limiter for authentication attempts (15 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many authentication requests from this IP. Please wait a few minutes before trying again.",
});

module.exports = { rateLimit, authLimiter };
