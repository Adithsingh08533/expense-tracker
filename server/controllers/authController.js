// server/controllers/authController.js
// Handles user registration, login, and profile updates

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user — password hashing happens in the model's pre-save hook
    const user = await User.create({ name, email, password });

    // Return token + basic user info (no password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (hidden by default in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      // Vague message on purpose — don't hint which field is wrong
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
      monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  // req.user is set by the protect middleware
  res.json(req.user);
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only update fields that were sent
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.currency = req.body.currency || user.currency;
    user.theme = req.body.theme || user.theme;
    user.monthlyBudget = req.body.monthlyBudget ?? user.monthlyBudget;

    // Update password only if a new one was provided
    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook re-hashes it
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      theme: updated.theme,
      token: generateToken(updated._id), // Issue a fresh token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getProfile, updateProfile };