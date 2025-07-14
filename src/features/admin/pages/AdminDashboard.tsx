import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AdminAppNavbar from "../components/AdminAppNavbar";
import AdminHeader from "../components/AdminHeader";
import AdminSideMenu from "../components/AdminSideMenu";
import ModuleManagementEnhanced from "../components/ModuleManagementEnhanced";
import SubscriptionManagementEnhanced from "../components/SubscriptionManagementEnhanced";
import OrganizationManagement from "../components/OrganizationManagement";
import CustomerManagement from "../components/CustomerManagement";
import InterveneAdminChat from "../components/InterveneAdminChat";
import WhatsAppTemplateManagement from "../components/WhatsAppTemplateManagement";
import LeadManagementSystem from "../components/LeadManagementSystem";
import ChatbotBuilderSystem from "../components/ChatbotBuilderSystem";
import AdminOverview from "../components/AdminOverview";
import AppTheme from "../../../themes/AppTheme";
import {
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../dashboard/theme/customizations";

// Exclude chart customizations to avoid prop warnings since we don't use charts in admin
const xThemeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Page titles based on route
const getPageTitle = (pathname: string) => {
  if (pathname.includes("/modules")) return "Module Management";
  if (pathname.includes("/subscriptions")) return "Subscription Management";
  if (pathname.includes("/organizations")) return "Organization Management";
  if (pathname.includes("/customers")) return "Customer Management";
  if (pathname.includes("/whatsapp-templates")) return "WhatsApp Templates";
  if (pathname.includes("/lead-management")) return "Lead Management";
  if (pathname.includes("/chatbot-builder")) return "Chatbot Builder";
  if (pathname.includes("/chat")) return "Admin Chat";
  if (pathname.includes("/analytics")) return "Analytics Dashboard";
  if (pathname.includes("/users")) return "User Management";
  if (pathname.includes("/settings")) return "Admin Settings";
  return "Admin Overview";
};

const getPageSubtitle = (pathname: string) => {
  if (pathname.includes("/modules"))
    return "Create, edit, and manage system modules";
  if (pathname.includes("/subscriptions"))
    return "Configure subscription plans and pricing";
  if (pathname.includes("/organizations"))
    return "Manage organizations and their information";
  if (pathname.includes("/customers"))
    return "Manage customers with dynamic forms and configurations";
  if (pathname.includes("/whatsapp-templates"))
    return "Create and manage WhatsApp message templates with live preview";
  if (pathname.includes("/lead-management"))
    return "Campaigns, dynamic forms, lead tracking, assignments, and tasks";
  if (pathname.includes("/chatbot-builder"))
    return "Create and manage visual conversation flows for your chatbot";
  if (pathname.includes("/chat"))
    return "Communicate with customers through WhatsApp-style interface";
  if (pathname.includes("/analytics"))
    return "View analytics and performance metrics";
  if (pathname.includes("/users"))
    return "Manage user accounts and permissions";
  if (pathname.includes("/settings")) return "Configure admin panel settings";
  return "Manage your application settings and configurations";
};

export default function AdminDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pageTitle = getPageTitle(location.pathname);
  const pageSubtitle = getPageSubtitle(location.pathname);
  const isChatPage = location.pathname === "/admin/chat";

  console.log("AdminDashboard - Current pathname:", location.pathname);
  console.log("AdminDashboard - Page title:", pageTitle);
  console.log("AdminDashboard - Is chat page:", isChatPage);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", height: "100vh" }}>
        {!isChatPage && (
          <AdminSideMenu open={sidebarOpen} onToggle={handleSidebarToggle} />
        )}
        {!isChatPage && <AdminAppNavbar />}
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: isChatPage ? "hidden" : "auto",
          })}
        >
          {isChatPage ? (
            <Routes>
              <Route path="chat" element={<InterveneAdminChat />} />
            </Routes>
          ) : (
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <AdminHeader title={pageTitle} subtitle={pageSubtitle} />
              {location.pathname.includes("/chatbot-builder") ? (
                <ChatbotBuilderSystem />
              ) : location.pathname.includes("/chatbot-builder-old") ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "20px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    minHeight: "600px",
                  }}
                >
                  <h1
                    style={{
                      color: "#1976d2",
                      fontSize: "2.5rem",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    🤖 Chatbot Builder
                  </h1>
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "30px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h2 style={{ color: "#333", marginBottom: "15px" }}>
                      ✅ System Ready
                    </h2>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        marginBottom: "20px",
                        color: "#666",
                      }}
                    >
                      Your chatbot builder is now accessible and working
                      properly.
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "30px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#e3f2fd",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "2px solid #1976d2",
                        }}
                      >
                        <h3 style={{ color: "#1976d2", marginBottom: "10px" }}>
                          🎯 Flow Creation
                        </h3>
                        <p style={{ color: "#666", fontSize: "0.9rem" }}>
                          Create and configure conversation flows with our
                          visual editor
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#e8f5e8",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "2px solid #4caf50",
                        }}
                      >
                        <h3 style={{ color: "#4caf50", marginBottom: "10px" }}>
                          📊 Analytics
                        </h3>
                        <p style={{ color: "#666", fontSize: "0.9rem" }}>
                          Monitor performance and user engagement metrics
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#fff3e0",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "2px solid #ff9800",
                        }}
                      >
                        <h3 style={{ color: "#ff9800", marginBottom: "10px" }}>
                          🧪 Testing
                        </h3>
                        <p style={{ color: "#666", fontSize: "0.9rem" }}>
                          Interactive testing and debugging tools
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route index element={<AdminOverview />} />
                  <Route
                    path="modules"
                    element={<ModuleManagementEnhanced />}
                  />
                  <Route
                    path="subscriptions"
                    element={<SubscriptionManagement />}
                  />
                  <Route
                    path="organizations"
                    element={<OrganizationManagement />}
                  />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route
                    path="whatsapp-templates"
                    element={<WhatsAppTemplateManagement />}
                  />
                  <Route
                    path="lead-management"
                    element={<LeadManagementSystem />}
                  />
                  <Route path="analytics" element={<AdminOverview />} />
                  <Route path="users" element={<AdminOverview />} />
                  <Route path="settings" element={<AdminOverview />} />
                  <Route path="help" element={<AdminOverview />} />
                  <Route path="profile" element={<AdminOverview />} />
                </Routes>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </AppTheme>
  );
}
