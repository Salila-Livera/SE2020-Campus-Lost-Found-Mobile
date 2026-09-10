// Central error handler – Express calls this when next(error) is used
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal server error";

  // Mongoose invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found (invalid ID format)";
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "Uploaded image is too large. Maximum allowed size is 10 MB.";
    } else {
      statusCode = 400;
      message = `Upload error: ${err.message}`;
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  // Log detailed error stack in non-production
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${err.name || "Error"}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
