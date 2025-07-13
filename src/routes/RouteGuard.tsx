import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function RouteGuard({
  children,
  requireAuth = false,
}: RouteGuardProps) {
  try {
    const location = useLocation();

    // Check authentication status
    const isAuthenticated = React.useMemo(() => {
      try {
        // This is a simple check - replace with your actual auth logic
        return localStorage.getItem("authToken") !== null;
      } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
      }
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
  } catch (error) {
    console.error("Error in RouteGuard:", error);
    // Fallback to login if there's an error
    return <Navigate to="/login" replace />;
  }
}
