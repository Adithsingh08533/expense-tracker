// client/src/context/useAuth.js
// Convenience hook — import this wherever you need auth state or actions

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Catch usage outside of AuthProvider early with a clear error message
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};