import React from "react";
import { Routes, Route } from "react-router-dom";
import RouteGuard from "./RouteGuard";
import LandingPage from "../components/LandingPage";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import SignIn from "../features/auth/sign-in/SignIn";
import SignInSide from "../features/auth/sign-in-side/SignInSide";
import SignUp from "../features/auth/sign-up/SignUp";
import Blog from "../pages/blog/Blog";
import Checkout from "../pages/checkout/Checkout";
import MarketingPage from "../pages/marketing-page/MarketingPage";
import DemoAccess from "../pages/DemoAccess";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        404: Page Not Found
      </Typography>
      <Typography variant="body1">
        The page you're looking for doesn't exist or has been moved.
      </Typography>
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <RouteGuard>
            <SignIn />
          </RouteGuard>
        }
      />
      <Route
        path="/login-side"
        element={
          <RouteGuard>
            <SignInSide />
          </RouteGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <RouteGuard>
            <SignUp />
          </RouteGuard>
        }
      />
      <Route path="/marketing" element={<MarketingPage />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/demo" element={<DemoAccess />} />

            {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected routes */}
      <Route
        path="/admin/*"
        element={
          <RouteGuard requireAuth={true}>
            <AdminDashboard />
          </RouteGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
