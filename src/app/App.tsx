import React from "react";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "../routes/routes";
import QuickAdminAccess from "../components/common/QuickAdminAccess";
import ErrorBoundary from "../components/common/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CssBaseline enableColorScheme />
        <AppRoutes />
        <QuickAdminAccess />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
