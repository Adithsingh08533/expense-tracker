// server/models/Budget.js
// Tracks budget limits per category per month

const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [1, "Limit must be at least 1"],
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Send alert when 80% of budget is used
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

// One budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);