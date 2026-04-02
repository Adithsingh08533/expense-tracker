// server/models/Expense.js
// Core model — every expense the user creates is stored here

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for fast user-specific queries
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title too long"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Health & Medical",
        "Housing",
        "Education",
        "Travel",
        "Utilities",
        "Other",
      ],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"],
      default: "Cash",
    },
    tags: [String], // e.g. ["work", "reimbursable"]
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },
    receiptUrl: {
      type: String,
      default: "", // Cloudinary URL for uploaded receipt photo
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index for fast filtering by user + date ─────────────────────────
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model("Expense", expenseSchema);