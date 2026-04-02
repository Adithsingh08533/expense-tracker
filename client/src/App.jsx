// client/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { NotificationProvider } from "./context/NotificationContext"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";



const LoginPage    = lazy(() => import("./pages/LoginPage"));
const SignupPage   = lazy(() => import("./pages/SignupPage"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const ExpensePage  = lazy(() => import("./pages/ExpensePage"));
const BudgetPage   = lazy(() => import("./pages/BudgetPage"));
const AnalyticsPage= lazy(() => import("./pages/AnalyticsPage"));
const ProfilePage  = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Loading spinner
const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={user ? <Navigate to="/"      replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/"      replace /> : <SignupPage />} />

        {/* Protected routes — all wrapped in AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/expenses"  element={<ExpensePage />} />
            <Route path="/budgets"   element={<BudgetPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*"    element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;