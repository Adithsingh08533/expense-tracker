// server/controllers/budgetController.js
// Handles budget CRUD + calculates spent vs limit per category

const Budget  = require("../models/Budget");
const Expense = require("../models/Expense");

// ─── GET /api/budgets ─────────────────────────────────────────────────────────
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const query = { user: req.user._id };
    if (month) query.month = Number(month);
    if (year)  query.year  = Number(year);

    const budgets = await Budget.find(query);

    // For each budget, calculate how much has been spent this month
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate   = new Date(budget.year, budget.month, 0, 23, 59, 59);

        const result = await Expense.aggregate([
          {
            $match: {
              user:     req.user._id,
              category: budget.category,
              date:     { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent      = result[0]?.total || 0;
        const percentage = Math.round((spent / budget.limit) * 100);
        const isAlert    = percentage >= budget.alertThreshold;

        return {
          ...budget.toObject(),
          spent,
          percentage,
          isAlert,
          remaining: Math.max(0, budget.limit - spent),
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/budgets ────────────────────────────────────────────────────────
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year, alertThreshold } = req.body;

    // Check if budget already exists for this category/month/year
    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      month: Number(month),
      year:  Number(year),
    });

    if (existing) {
      return res.status(400).json({
        message: `Budget for ${category} in this month already exists`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month:          Number(month),
      year:           Number(year),
      alertThreshold: alertThreshold || 80,
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/budgets/:id ─────────────────────────────────────────────────────
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // Only the owner can update
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/budgets/:id ──────────────────────────────────────────────────
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await budget.deleteOne();
    res.json({ message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };