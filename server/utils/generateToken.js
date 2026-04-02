// server/utils/generateToken.js
// Creates a signed JWT — called after successful login or signup

const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload: only store the ID (minimal info)
    process.env.JWT_SECRET,   // Secret from .env
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};

module.exports = generateToken;