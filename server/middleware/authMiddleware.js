// server/middleware/authMiddleware.js
// Runs before every protected route — verifies JWT and attaches user to req

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as "Bearer <token>"
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify the token — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (minus password field)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // Proceed to the route handler
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };