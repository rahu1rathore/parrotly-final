import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function RouteGuard({
  children,
  requireAuth = false,
}: RouteGuardProps) {
  const location = useLocation();

  // Check authentication status
  const isAuthenticated = React.useMemo(() => {
    // This is a simple check - replace with your actual auth logic
    return localStorage.getItem("authToken") !== null;
  }, []);

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && location.pathname === "/login") {
    // Redirect authenticated users away from login page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
