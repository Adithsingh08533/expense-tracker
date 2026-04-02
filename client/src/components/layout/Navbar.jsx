// client/src/components/layout/Navbar.jsx

import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import NotificationBell from "../../context/NotificationBell";
import api from "../../services/api";
import toast from "react-hot-toast";

const PAGE_TITLES = {
  "/":          { title: "Dashboard",  emoji: "📊" },
  "/expenses":  { title: "Expenses",   emoji: "💸" },
  "/budgets":   { title: "Budgets",    emoji: "🎯" },
  "/analytics": { title: "Analytics",  emoji: "📈" },
  "/profile":   { title: "Profile",    emoji: "👤" },
};

const Navbar = ({ onMenuClick }) => {
  const location         = useLocation();
  const { user, updateUser } = useAuth();
  const page = PAGE_TITLES[location.pathname] || { title: "ExpenseIQ", emoji: "💰" };

  const toggleTheme = async () => {
    const oldTheme = user?.theme || "light";
    const newTheme = oldTheme === "dark" ? "light" : "dark";

    // Instant UI feedback
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    updateUser({ theme: newTheme });

    try {
      const { data } = await api.put("/auth/profile", { theme: newTheme });
      updateUser(data);
    } catch {
      toast.error("Failed to save theme");
      // Roll back on error
      document.documentElement.classList.toggle("dark", oldTheme === "dark");
      updateUser({ theme: oldTheme });
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100
                       dark:border-gray-800 flex items-center justify-between
                       px-4 lg:px-6 sticky top-0 z-10">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100
                     dark:hover:bg-gray-800 transition"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg">{page.emoji}</span>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {page.title}
          </h2>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                     transition text-lg"
          title="Toggle theme"
        >
          {user?.theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500
                        to-purple-600 flex items-center justify-center
                        text-white text-xs font-bold ml-1">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;