// server/routes/authRoutes.js
// Defines all authentication-related API endpoints

const express = require("express");
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes — no token needed
router.post("/signup", signup);
router.post("/login",  login);

// Protected routes — must send valid JWT
router.get("/me",         protect, getProfile);
router.put("/profile",    protect, updateProfile);

module.exports = router;