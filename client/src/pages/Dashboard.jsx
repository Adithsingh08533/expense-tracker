// client/src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1","#22d3ee","#f59e0b","#10b981",
                "#f43f5e","#8b5cf6","#14b8a6","#fb923c"];

const StatCard = ({ title, value, sub, color, icon }) => (
  <div className={`card p-4 sm:p-5 border-l-4 ${color} w-full`}>
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <span className="text-lg sm:text-xl">{icon}</span>
    </div>
    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs sm:text-sm text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user }                          = useAuth();
  const [summary, setSummary]             = useState([]);
  const [totalSpent, setTotalSpent]       = useState(0);
  const [recentExpenses, setRecent]       = useState([]);
  const [monthlyTrend, setTrend]          = useState([]);
  const [loading, setLoading]             = useState(true);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, expenseRes, analyticsRes] = await Promise.all([
          api.get(`/expenses/summary?month=${month}&year=${year}`),
          api.get("/expenses?limit=5&sortBy=date&order=desc"),
          api.get("/analytics/overview"),
        ]);

        setSummary(summaryRes.data.summary);
        setTotalSpent(summaryRes.data.totalSpent);
        setRecent(expenseRes.data.expenses);

        const formatted = analyticsRes.data.monthlyTrend.map((m) => ({
          name:  new Date(m._id.year, m._id.month - 1)
                   .toLocaleString("default", { month: "short" }),
          spent: parseFloat(m.total.toFixed(2)),
        }));
        setTrend(formatted);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  const budget    = user?.monthlyBudget || 0;
  const remaining = Math.max(0, budget - totalSpent);
  const budgetPct = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="page">

      {/* Greeting banner */}
      <div className="card p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600
                      border-0 text-white">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          {now.toLocaleString("default", { weekday:"long", month:"long", day:"numeric" })}
        </p>
        {budget > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-xs sm:text-sm text-blue-100 mb-1">
              <span>Monthly budget usage</span>
              <span className="font-semibold">{budgetPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPct >= 90 ? "bg-red-400" :
                  budgetPct >= 70 ? "bg-yellow-300" : "bg-green-400"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-100 mt-1">
              <span>${totalSpent.toFixed(2)} spent</span>
              <span>${budget} limit</span>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total spent"    value={`$${totalSpent.toFixed(2)}`}
          sub="This month"              color="border-blue-500"   icon="💸" />
        <StatCard title="Budget"         value={budget > 0 ? `$${budget}` : "Not set"}
          sub="Monthly limit"           color="border-purple-500" icon="🎯" />
        <StatCard title="Remaining"      value={budget > 0 ? `$${remaining.toFixed(2)}` : "—"}
          sub={budget > 0 ? `${100 - budgetPct}% left` : "Set in profile"}
          color={budgetPct >= 90 ? "border-red-500" : "border-green-500"} icon="💰" />
        <StatCard title="Categories"     value={summary.length}
          sub="Active this month"       color="border-cyan-500"   icon="📊" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Bar chart */}
        <div className="card p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            📅 Monthly trend
          </h2>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} className="min-h-[200px]">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => [`$${v}`, "Spent"]}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 sm:h-48 text-gray-400">
              <span className="text-2xl sm:text-3xl mb-2">📊</span>
              <p className="text-xs sm:text-sm">No data yet</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            🍩 Spending by category
          </h2>
          {summary.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} className="min-h-[200px]">
              <PieChart>
                <Pie data={summary} dataKey="total" nameKey="_id"
                  cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {summary.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 sm:h-48 text-gray-400">
              <span className="text-2xl sm:text-3xl mb-2">🍩</span>
              <p className="text-xs sm:text-sm">No expenses this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            🕐 Recent expenses
          </h2>
          <Link to="/expenses"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-1 sm:space-y-2">
            {recentExpenses.map((exp) => (
              <div key={exp._id}
                className="flex items-center justify-between py-2 sm:py-2.5 px-2 sm:px-3
                           rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50
                           transition group">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30
                                  flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                    {exp.category === "Food & Dining"    ? "🍔" :
                     exp.category === "Transportation"   ? "🚗" :
                     exp.category === "Shopping"         ? "🛍️" :
                     exp.category === "Entertainment"    ? "🎬" :
                     exp.category === "Health & Medical" ? "🏥" :
                     exp.category === "Housing"          ? "🏠" :
                     exp.category === "Education"        ? "📚" :
                     exp.category === "Travel"           ? "✈️" :
                     exp.category === "Utilities"        ? "💡" : "💸"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {exp.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {exp.category} · {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-red-500 flex-shrink-0 ml-2">
                  -${exp.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-gray-400">
            <span className="text-3xl sm:text-4xl mb-2">💸</span>
            <p className="text-xs sm:text-sm font-medium">No expenses yet</p>
            <Link to="/expenses"
              className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
              Add your first expense →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;