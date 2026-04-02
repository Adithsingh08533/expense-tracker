// server/models/Category.js
// Stores custom categories a user can create beyond the defaults

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    name: {
      type:      String,
      required:  [true, "Category name is required"],
      trim:      true,
      maxlength: [30, "Category name too long"],
    },
    color: {
      type:    String,
      default: "#6366f1", // default indigo color
    },
    icon: {
      type:    String,
      default: "💰",
    },
  },
  {
    timestamps: true,
  }
);

// One user cannot have two categories with the same name
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);