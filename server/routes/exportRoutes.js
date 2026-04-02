// server/routes/exportRoutes.js
// Export expenses as PDF or CSV

const express    = require("express");
const router     = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { exportPDF, exportCSV } = require("../controllers/exportController");

router.use(protect);

router.get("/pdf", exportPDF);
router.get("/csv", exportCSV);

module.exports = router;