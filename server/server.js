// server/server.js
// Entry point: boots Express, connects middleware, mounts all routes

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Vite default port
  credentials: true,
}));
app.use(express.json());           // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/expenses",  require("./routes/expenseRoutes"));
app.use("/api/budgets",   require("./routes/budgetRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
// uncomment this line
app.use("/api/export", require("./routes/exportRoutes"));
//app.use("/api/export",    require("./routes/exportRoutes"));

// Health check endpoint (useful for Render deployment)
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── Global error handler (must be last) ─────────────────────────────────────

// add this before app.use(errorHandler)
app.use((err, req, res, next) => {
  console.error("FULL ERROR:", err);
  next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));