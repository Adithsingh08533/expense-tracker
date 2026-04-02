// client/src/services/api.js
// Single Axios instance used across the entire frontend
// Automatically attaches JWT and handles 401 errors

import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach JWT to every request ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: global error handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — log user out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Helper: GET with retries (useful for unstable network or temporary API downtime)
api.getWithRetry = async (url, config = {}, retries = 2, delayMs = 400) => {
  let attempt = 0;
  while (true) {
    try {
      return await api.get(url, config);
    } catch (error) {
      if (attempt >= retries || !error || !error.isAxiosError) {
        throw error;
      }
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default api;