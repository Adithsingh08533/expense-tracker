// client/src/context/NotificationContext.jsx
// Fetches budgets and exposes alerts to any component

import { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user }          = useAuth();
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const now   = new Date();
      const month = now.getMonth() + 1;
      const year  = now.getFullYear();

      const { data } = await api.get(`/budgets?month=${month}&year=${year}`);

      // Only keep budgets that have crossed alert threshold
      const activeAlerts = data.filter((b) => b.isAlert);
      setAlerts(activeAlerts);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [user]);

  // Fetch on mount and every 5 minutes
  useEffect(() => {
  const load = async () => {
    await fetchAlerts();   // wrapped call ✅
  };

  load();

  const interval = setInterval(load, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [fetchAlerts]);

  return (
    <NotificationContext.Provider value={{ alerts, fetchAlerts }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};