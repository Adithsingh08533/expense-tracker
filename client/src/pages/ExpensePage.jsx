// client/src/pages/ExpensePage.jsx
// Full expense management — list, add, edit, delete, filter, search

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

// ─── Category list ────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Entertainment",
  "Health & Medical", "Housing", "Education", "Travel", "Utilities", "Other",
];

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"];

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = {
  title: "", amount: "", category: "Food & Dining",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "Cash", description: "", isRecurring: false, recurringFrequency: null,
};

// ─── ExpenseForm — declared outside ──────────────────────────────────────────
const ExpenseForm = ({ form, setForm, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          {form._id ? "Edit expense" : "Add expense"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text" required placeholder="e.g. Lunch at cafe"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
          <input
            type="number" required min="0.01" step="0.01" placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input
            type="date" required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment method</label>
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={2} placeholder="Any extra notes..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="recurring"
            checked={form.isRecurring}
            onChange={(e) => setForm({
              ...form,
              isRecurring: e.target.checked,
              recurringFrequency: e.target.checked ? "monthly" : null,
            })}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
            Recurring expense
          </label>
        </div>

        {/* Frequency — shown only if recurring */}
        {form.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
            <select
              value={form.recurringFrequency || "monthly"}
              onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-2">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                       text-white font-semibold disabled:opacity-60 transition text-sm"
          >
            {loading ? "Saving..." : form._id ? "Update" : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ─── Expense row — declared outside ──────────────────────────────────────────
const ExpenseRow = ({ exp, onEdit, onDelete }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b
                  border-gray-100 dark:border-gray-700 last:border-0 gap-2 sm:gap-0">
    <div className="flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{exp.title}</p>
        {exp.isRecurring && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full self-start sm:self-auto">
            {exp.recurringFrequency}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {exp.category} · {exp.paymentMethod} · {new Date(exp.date).toLocaleDateString()}
      </p>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-4">
      <span className="text-sm font-bold text-red-500">-${exp.amount.toFixed(2)}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(exp)}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >Edit</button>
        <button
          onClick={() => onDelete(exp._id)}
          className="text-xs text-red-400 hover:text-red-600 font-medium"
        >Delete</button>
      </div>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ExpensePage = () => {
  const [expenses, setExpenses]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);

  // ── Filters ──
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [page, setPage]             = useState(1);

  // ── Fetch expenses ──
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 10, sortBy: "date", order: "desc",
        ...(search    && { search }),
        ...(category  && { category }),
        ...(startDate && { startDate }),
        ...(endDate   && { endDate }),
      });

      const { data } = await api.get(`/expenses?${params}`);
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }, [page, category, startDate, endDate, search]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // Search with debounce
  useEffect(() => {       
  const timer = setTimeout(() => fetchExpenses(), 400);
  return () => clearTimeout(timer);
}, [fetchExpenses]);

  // ── Open modal for add ──
  const handleAdd = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  // ── Open modal for edit ──
  const handleEdit = (exp) => {
    setForm({
      ...exp,
      date: new Date(exp.date).toISOString().split("T")[0],
      amount: exp.amount.toString(),
    });
    setShowModal(true);
  };

  // ── Submit add or edit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (form._id) {
        await api.put(`/expenses/${form._id}`, form);
        toast.success("Expense updated!");
      } else {
        await api.post("/expenses", form);
        toast.success("Expense added!");
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Deleted!");
      fetchExpenses();
    } catch {
      toast.error("Failed to delete");
    }
  };
  // Add this function inside ExpensePage component
const handleExport = async (type) => {
  try {
    const params = new URLSearchParams({
      ...(category  && { category }),
      ...(startDate && { startDate }),
      ...(endDate   && { endDate }),
    });

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/export/${type}?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error("Export failed");

    // Create download link from blob
    const blob = await response.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `expenses.${type}`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${type.toUpperCase()} downloaded!`);
  } catch {
    toast.error("Export failed");
  }
};

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <div className="flex flex-wrap gap-2">
          {/* Export buttons */}
          <button
            onClick={() => handleExport("csv")}
            className="px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 text-white
                       font-semibold rounded-lg transition text-xs sm:text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 text-white
                       font-semibold rounded-lg transition text-xs sm:text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={handleAdd}
            className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                       font-semibold rounded-lg transition text-xs sm:text-sm"
          >
            + Add expense
          </button>
        </div>
      </div>
      

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-sm
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <input
          type="text" placeholder="Search expenses..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date" value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date" value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Expense list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : expenses.length > 0 ? (
          <>
            {expenses.map((exp) => (
              <ExpenseRow
                key={exp._id}
                exp={exp}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4
                              border-t border-gray-100 dark:border-gray-700 gap-3">
                <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {" "}· {pagination.totalItems} total
                </p>
                <div className="flex gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600
                               text-xs sm:text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600
                               text-xs sm:text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 sm:py-12">
            <p className="text-3xl sm:text-4xl mb-3">💸</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">No expenses found</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Click "Add expense" to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ExpenseForm
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

export default ExpensePage;