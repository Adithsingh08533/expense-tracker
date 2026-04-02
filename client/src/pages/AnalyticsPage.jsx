// client/src/pages/AnalyticsPage.jsx
// Full analytics — monthly trends, category breakdown, daily spending, top expenses

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

const COLORS = [
  "#6366f1","#22d3ee","#f59e0b","#10b981",
  "#f43f5e","#8b5cf6","#14b8a6","#fb923c","#06b6d4","#84cc16",
];

// ─── Section card wrapper — declared outside ──────────────────────────────────
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm
                  border border-gray-100 dark:border-gray-700">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── Stat card — declared outside ────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-l-4 ${color}`}>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const [overview, setOverview]   = useState(null);
  const [insights, setInsights]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  // ── Fetch overview data ──
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, summaryRes] = await Promise.all([
        api.getWithRetry("/analytics/overview", {}, 2, 300),
        api.getWithRetry(`/expenses/summary?month=${month}&year=${year}`, {}, 2, 300),
      ]);

      // Format monthly trend for line chart
      const trend = overviewRes.data.monthlyTrend.map((m) => ({
        name:  new Date(m._id.year, m._id.month - 1)
                 .toLocaleString("default", { month: "short" }),
        spent: parseFloat(m.total.toFixed(2)),
        count: m.count,
      }));

      // Format category for pie + bar
      const categories = summaryRes.data.summary.map((s) => ({
        name:  s._id,
        total: parseFloat(s.total.toFixed(2)),
        count: s.count,
      }));

      setOverview({
        trend,
        categories,
        topExpenses:   overviewRes.data.topExpenses,
        totalSpent:    summaryRes.data.totalSpent,
      });
    } catch (err) {
      const code = err?.response?.status;
      toast.error(`Failed to load analytics${code ? ` (HTTP ${code})` : ""}`);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ── Fetch AI insights ──
  const fetchInsights = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.get("/analytics/insights");
      setInsights(data.insights || []);
    } catch {
      toast.error("Failed to load AI insights");
    } finally {
      setAiLoading(false);
    }
  };

  // Insight card colors
  const severityStyle = {
    good:    "border-green-400 bg-green-50  dark:bg-green-900/20",
    warning: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    danger:  "border-red-400   bg-red-50    dark:bg-red-900/20",
  };

  const severityIcon = { good: "✅", warning: "⚠️", danger: "🚨" };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const { trend, categories, topExpenses, totalSpent } = overview || {};

  // Highest spending month
  const peakMonth = trend?.reduce(
    (max, m) => (m.spent > (max?.spent || 0) ? m : max), null
  );

  // Average monthly spend
  const avgSpend = trend?.length
    ? (trend.reduce((s, m) => s + m.spent, 0) / trend.length).toFixed(2)
    : 0;

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {now.toLocaleString("default", { month: "long", year: "numeric" })} insights
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={aiLoading}
          className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60
                     text-white font-semibold rounded-lg transition text-xs sm:text-sm flex items-center gap-2"
        >
          {aiLoading ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 sm:w-4 sm:h-4 border-2
                               border-white border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : "✨ Get AI insights"}
        </button>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Spent this month"
          value={`$${(totalSpent || 0).toFixed(2)}`}
          color="border-blue-500"
        />
        <StatCard
          label="Avg monthly spend"
          value={`$${avgSpend}`}
          color="border-purple-500"
        />
        <StatCard
          label="Peak month"
          value={peakMonth ? `${peakMonth.name} $${peakMonth.spent}` : "—"}
          color="border-amber-500"
        />
        <StatCard
          label="Categories used"
          value={categories?.length || 0}
          color="border-teal-500"
        />
      </div>

      {/* ── AI insights panel ── */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            ✨ AI spending insights
          </h2>
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-lg sm:rounded-2xl p-3 sm:p-4 border-l-4 ${severityStyle[insight.severity] || severityStyle.good}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm sm:text-base">{severityIcon[insight.severity] || "💡"}</span>
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {insight.title}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Monthly trend line chart */}
        <ChartCard
          title="Spending trend"
          subtitle="Last 6 months"
        >
          {trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} className="min-h-[220px]">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v}`, "Spent"]} />
                <Line
                  type="monotone" dataKey="spent"
                  stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#6366f1" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-xs sm:text-sm text-center py-8 sm:py-10">No data yet</p>
          )}
        </ChartCard>

        {/* Category pie chart */}
        <ChartCard
          title="Category breakdown"
          subtitle={`${now.toLocaleString("default", { month: "long" })} spending`}
        >
          {categories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} className="min-h-[220px]">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={35}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${v}`} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-xs sm:text-sm text-center py-8 sm:py-10">
              No expenses this month
            </p>
          )}
        </ChartCard>
      </div>

      {/* ── Category bar chart ── */}
      <ChartCard
        title="Spending by category"
        subtitle="Amount spent per category this month"
      >
        {categories?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240} className="min-h-[240px]">
            <BarChart data={categories} layout="vertical" margin={{ left: 15, right: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }}
                     tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v) => [`$${v}`, "Spent"]} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-xs sm:text-sm text-center py-8 sm:py-10">No data yet</p>
        )}
      </ChartCard>

      {/* ── Top expenses ── */}
      <ChartCard
        title="Top expenses this month"
        subtitle="Highest single transactions"
      >
        {topExpenses?.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {topExpenses.map((exp, i) => (
              <div
                key={exp._id}
                className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b
                           border-gray-100 dark:border-gray-700 last:border-0"
              >
                {/* Rank badge */}
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900
                                 text-blue-600 dark:text-blue-300 text-xs font-bold
                                 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {exp.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {exp.category} · {new Date(exp.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-red-500 flex-shrink-0">
                  ${exp.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs sm:text-sm text-center py-4 sm:py-6">
            No expenses this month
          </p>
        )}
      </ChartCard>

    </div>
  );
};

export default AnalyticsPage;