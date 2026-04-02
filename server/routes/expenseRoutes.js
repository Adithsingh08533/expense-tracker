const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require("../controllers/expenseController");

router.use(protect);

router.get("/", getExpenses);
router.post("/", createExpense);
router.get("/summary", getExpenseSummary);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;