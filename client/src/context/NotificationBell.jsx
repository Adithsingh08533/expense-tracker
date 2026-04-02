// client/src/components/NotificationBell.jsx
// Bell icon in navbar — shows red dot when budget alerts exist

import { useState } from "react";
import { useNotifications } from "./NotificationContext";

const NotificationBell = () => {
  const { alerts }      = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                   transition relative"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
               6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
               0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Red dot badge */}
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500
                           rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800
                        rounded-2xl shadow-lg border border-gray-200
                        dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Budget alerts
            </h3>
          </div>

          {alerts.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700
                              last:border-0 ${
                    alert.percentage >= 100
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-yellow-50 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.category}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      alert.percentage >= 100
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {alert.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${alert.spent.toFixed(2)} of ${alert.limit.toFixed(2)} used
                    {alert.percentage >= 100
                      ? " — Over budget!"
                      : " — Near limit"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All budgets are on track
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;