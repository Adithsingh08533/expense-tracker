// client/src/components/ProtectedRoute.jsx
// Wrapper that redirects to /login if the user is not authenticated

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = () => {
  const { user } = useAuth();

  // If no user in context, send to login
  // Outlet renders the child route if authenticated
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;