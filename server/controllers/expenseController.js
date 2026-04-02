// server/controllers/expenseController.js
// All expense CRUD logic — create, read, update, delete + filter/search/paginate

const Expense = require("../models/Expense");

// ─── GET /api/expenses ────────────────────────────────────────────────────────
const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      search,
      sortBy = "date",
      order = "desc",
    } = req.query;

    // Build query object dynamically
    const query = { user: req.user._id };

    if (category) query.category = category;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }

    // Text search on title and description
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        currentPage: Number(page),
        totalPages:  Math.ceil(total / limit),
        totalItems:  total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/expenses ───────────────────────────────────────────────────────
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      user: req.user._id, // Always tie to logged-in user
    });
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/expenses/:id ────────────────────────────────────────────────────
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Authorization: only the owner can view their expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/expenses/:id ────────────────────────────────────────────────────
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // findByIdAndUpdate with runValidators ensures schema rules are checked
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/expenses/:id ─────────────────────────────────────────────────
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/expenses/summary ────────────────────────────────────────────────
const getExpenseSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    // MongoDB aggregation: group by category and sum amounts
    const summary = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id:   "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = summary.reduce((acc, s) => acc + s.total, 0);
    res.json({ summary, totalSpent });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};