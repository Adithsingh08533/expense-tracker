// server/controllers/analyticsController.js

const Expense = require("../models/Expense");

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id:   { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const topExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfMonth },
    })
      .sort({ amount: -1 })
      .limit(5);

    res.json({ monthlyTrend, categoryBreakdown, topExpenses });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/analytics/insights — rule-based, no API key needed ──────────────
const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const start  = new Date(now.getFullYear(), now.getMonth(), 1);

    const spendingData = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: start } } },
      {
        $group: {
          _id:   "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = spendingData.reduce((sum, s) => sum + s.total, 0);
    const budget     = req.user.monthlyBudget || 0;
    const insights   = [];

    // Insight 1 — budget check
    if (budget > 0) {
      const pct = (totalSpent / budget) * 100;
      if (pct >= 100) {
        insights.push({
          title:       "Over budget!",
          description: `You have spent $${totalSpent.toFixed(2)} which exceeds your $${budget} budget. Consider cutting non-essential expenses.`,
          severity:    "danger",
        });
      } else if (pct >= 80) {
        insights.push({
          title:       "Approaching budget limit",
          description: `You have used ${pct.toFixed(0)}% of your monthly budget. Slow down spending for the rest of the month.`,
          severity:    "warning",
        });
      } else {
        insights.push({
          title:       "Budget on track",
          description: `You have used ${pct.toFixed(0)}% of your budget. Keep it up!`,
          severity:    "good",
        });
      }
    }

    // Insight 2 — top spending category
    if (spendingData.length > 0) {
      const top = spendingData[0];
      const pct = ((top.total / totalSpent) * 100).toFixed(0);
      insights.push({
        title:       `High spend on ${top._id}`,
        description: `${top._id} is your top category at $${top.total.toFixed(2)} (${pct}% of total). Review if this aligns with your priorities.`,
        severity:    pct > 50 ? "warning" : "good",
      });
    }

    // Insight 3 — transaction count
    const totalTransactions = spendingData.reduce((s, c) => s + c.count, 0);
    if (totalTransactions > 20) {
      insights.push({
        title:       "Many small transactions",
        description: `You have made ${totalTransactions} transactions this month. Small frequent purchases add up — try bundling errands.`,
        severity:    "warning",
      });
    } else if (totalTransactions > 0) {
      insights.push({
        title:       "Spending looks controlled",
        description: `You have made ${totalTransactions} transactions this month. Your spending frequency looks healthy.`,
        severity:    "good",
      });
    }

    // Fallback if no data
    if (insights.length === 0) {
      insights.push({
        title:       "No expenses yet",
        description: "Start adding expenses to get personalized insights.",
        severity:    "good",
      });
    }

    res.json({ insights });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getInsights };