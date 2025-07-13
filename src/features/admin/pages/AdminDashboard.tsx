import React, { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Extension as ModuleIcon,
  Subscriptions as SubscriptionIcon,
} from "@mui/icons-material";
import ModuleManagement from "../components/ModuleManagement";
import SubscriptionManagement from "../components/SubscriptionManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    "aria-controls": `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Typography color="text.primary">Admin Panel</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage modules, subscriptions, and system configurations
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab
            label="Overview"
            icon={<DashboardIcon />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            label="Module Management"
            icon={<ModuleIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            label="Subscription Management"
            icon={<SubscriptionIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to the admin panel. Use the tabs above to navigate between
            different management sections.
          </Typography>

          <Box
            sx={{
              mt: 4,
              display: "grid",
              gap: 3,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <ModuleIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Module Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and manage system modules with activation controls
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, textAlign: "center" }}>
              <SubscriptionIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Subscription Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure subscription plans with module permissions and pricing
              </Typography>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <ModuleManagement />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <SubscriptionManagement />
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;
