// client/src/context/AuthContext.jsx
// Provides authentication state to the entire app — wrap your root with this

import { createContext, useState } from "react";
import api from "../services/api";

// Named export so useAuth.js can import it
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Persist user across page refreshes by reading from localStorage on init
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [loading, setLoading] = useState(false);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // Store token separately — the Axios interceptor reads it from here
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

  // ─── Signup ───────────────────────────────────────────────────────────────
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

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ─── Update cached user (e.g. after profile edit) ─────────────────────────
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};