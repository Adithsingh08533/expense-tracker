// client/src/pages/BudgetPage.jsx
// Budget management — set limits per category, track spending, show alerts

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Entertainment",
  "Health & Medical", "Housing", "Education", "Travel", "Utilities", "Other",
];

// ─── Budget form — declared outside ──────────────────────────────────────────
const BudgetForm = ({ form, setForm, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center
                  justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {form._id ? "Edit budget" : "Add budget"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            disabled={!!form._id}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-60"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Budget limit ($)
          </label>
          <input
            type="number" required min="1" step="0.01" placeholder="e.g. 500"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Alert threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alert at (%) — default 80%
          </label>
          <input
            type="number" min="1" max="100" placeholder="80"
            value={form.alertThreshold}
            onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            You will see a warning when spending reaches this percentage
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50
                       dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       text-white font-semibold disabled:opacity-60 transition"
          >
            {loading ? "Saving..." : form._id ? "Update" : "Add budget"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ─── Progress bar card — declared outside ─────────────────────────────────────
const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const pct       = Math.min(budget.percentage, 100);
  const isOver    = budget.percentage >= 100;
  const isWarning = budget.percentage >= budget.alertThreshold && !isOver;

  const barColor = isOver
    ? "bg-red-500"
    : isWarning
    ? "bg-yellow-500"
    : "bg-blue-500";

  const statusColor = isOver
    ? "text-red-500"
    : isWarning
    ? "text-yellow-500"
    : "text-green-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm
                    border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {budget.category}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {budget.month}/{budget.year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert badge */}
          {isOver && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              Over budget!
            </span>
          )}
          {isWarning && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              Near limit
            </span>
          )}
          <button
            onClick={() => onEdit(budget)}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="text-xs text-red-400 hover:text-red-600 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Amounts */}
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Spent: <span className={`font-semibold ${statusColor}`}>
            ${budget.spent.toFixed(2)}
          </span>
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Limit: <span className="font-semibold text-gray-700 dark:text-gray-300">
            ${budget.limit.toFixed(2)}
          </span>
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          <span className={`font-semibold ${statusColor}`}>
            {budget.percentage}%
          </span> used
        </span>
      </div>

      {/* Remaining */}
      {!isOver && (
        <p className="text-xs text-gray-400 mt-2">
          ${budget.remaining.toFixed(2)} remaining
        </p>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const emptyForm = {
  category:       "Food & Dining",
  limit:          "",
  alertThreshold: 80,
  month:          new Date().getMonth() + 1,
  year:           new Date().getFullYear(),
};

const BudgetPage = () => {
  const [budgets, setBudgets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);

  // Month/year filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear]   = useState(new Date().getFullYear());

  // ── Fetch budgets ──
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets?month=${month}&year=${year}`);
      setBudgets(data);
    } catch {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // ── Add ──
  const handleAdd = () => {
    setForm({ ...emptyForm, month, year });
    setShowModal(true);
  };

  // ── Edit ──
  const handleEdit = (budget) => {
    setForm({
      _id:            budget._id,
      category:       budget.category,
      limit:          budget.limit.toString(),
      alertThreshold: budget.alertThreshold,
      month:          budget.month,
      year:           budget.year,
    });
    setShowModal(true);
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (form._id) {
        await api.put(`/budgets/${form._id}`, {
          limit:          Number(form.limit),
          alertThreshold: Number(form.alertThreshold),
        });
        toast.success("Budget updated!");
      } else {
        await api.post("/budgets", {
          ...form,
          limit:          Number(form.limit),
          alertThreshold: Number(form.alertThreshold),
        });
        toast.success("Budget created!");
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success("Budget deleted!");
      fetchBudgets();
    } catch {
      toast.error("Failed to delete budget");
    }
  };

  // Summary stats
  const totalBudget  = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent   = budgets.reduce((s, b) => s + b.spent, 0);
  const alertCount   = budgets.filter((b) => b.isAlert).length;

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold rounded-lg transition text-sm"
        >
          + Add budget
        </button>
      </div>

      {/* Month/year selector */}
      <div className="flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm
                          border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total budgeted</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              ${totalBudget.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm
                          border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total spent</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm
                          border-l-4 ${alertCount > 0 ? "border-red-500" : "border-green-500"}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active alerts</p>
            <p className={`text-xl font-bold mt-1 ${
              alertCount > 0 ? "text-red-500" : "text-green-500"
            }`}>
              {alertCount} {alertCount === 1 ? "category" : "categories"}
            </p>
          </div>
        </div>
      )}

      {/* Budget cards grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No budgets for this month
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Click "Add budget" to set spending limits
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <BudgetForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default BudgetPage;