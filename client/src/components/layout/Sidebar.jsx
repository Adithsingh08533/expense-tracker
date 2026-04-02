// client/src/components/layout/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const NAV_ITEMS = [
  { path: "/",          label: "Dashboard",  icon: "📊" },
  { path: "/expenses",  label: "Expenses",   icon: "💸" },
  { path: "/budgets",   label: "Budgets",    icon: "🎯" },
  { path: "/analytics", label: "Analytics",  icon: "📈" },
  { path: "/profile",   label: "Profile",    icon: "👤" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                            justify-center text-white text-lg font-bold shadow-md">
              💰
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                ExpenseIQ
              </h1>
              <p className="text-xs text-gray-400">Smart tracking</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider
                        px-3 mb-3">
            Menu
          </p>
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                font-medium transition-all duration-150
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              `}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500
                            to-purple-600 flex items-center justify-center
                            text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                       rounded-xl transition font-medium"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;