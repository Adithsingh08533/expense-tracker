// server/routes/analyticsRoutes.js

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getOverview, getInsights } = require("../controllers/analyticsController");

router.use(protect);

router.get("/overview",  getOverview);
router.get("/insights",  getInsights);

module.exports = router;