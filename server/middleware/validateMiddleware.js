// server/middleware/validateMiddleware.js
// Reads validation errors set by express-validator and returns 400 if any exist

const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return only the first error message to keep response clean
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  next();
};

module.exports = { validate };