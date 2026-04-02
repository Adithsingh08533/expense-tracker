// client/src/context/AuthProvider.jsx
// Only exports one component — satisfies fast refresh rule

import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    const activeTheme = user?.theme || localTheme || "light";
    applyTheme(activeTheme);

    if (user && user.theme && localTheme !== user.theme) {
      localStorage.setItem("theme", user.theme);
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(merged));
    applyTheme(merged.theme || "light");
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};