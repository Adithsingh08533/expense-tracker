// server/middleware/errorMiddleware.js
// Central error handler — catches anything passed to next(error)

const errorHandler = (err, req, res, next) => {
  // Default to 500 if status not already set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    return res.status(400).json({
      message: `Duplicate value for: ${Object.keys(err.keyValue).join(", ")}`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(". ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired, please login again" });
  }

  res.status(statusCode).json({
    message: err.message || "Server Error",
    // Show stack trace only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { errorHandler };