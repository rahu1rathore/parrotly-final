import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import {
  Extension as ModuleIcon,
  Subscriptions as SubscriptionIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  TrendingUp,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();

  // Mock statistics - replace with real data
  const stats = [
    {
      title: "Total Modules",
      value: "12",
      change: "+2 this month",
      color: "primary.main",
      icon: <ModuleIcon />,
      path: "/admin/modules",
    },
    {
      title: "Active Subscriptions",
      value: "8",
      change: "+3 this week",
      color: "secondary.main",
      icon: <SubscriptionIcon />,
      path: "/admin/subscriptions",
    },
    {
      title: "Total Users",
      value: "245",
      change: "+12 today",
      color: "success.main",
      icon: <PeopleIcon />,
      path: "/admin/users",
    },
    {
      title: "Revenue",
      value: "$12,450",
      change: "+15% this month",
      color: "warning.main",
      icon: <TrendingUp />,
      path: "/admin/analytics",
    },
  ];

  const quickActions = [
    {
      title: "Create New Module",
      description: "Add a new module to the system",
      icon: <ModuleIcon />,
      color: "primary",
      action: () => navigate("/admin/modules"),
    },
    {
      title: "Add Subscription Plan",
      description: "Create a new subscription tier",
      icon: <SubscriptionIcon />,
      color: "secondary",
      action: () => navigate("/admin/subscriptions"),
    },
    {
      title: "View Analytics",
      description: "Check system performance metrics",
      icon: <AnalyticsIcon />,
      color: "info",
      action: () => navigate("/admin/analytics"),
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: <PeopleIcon />,
      color: "success",
      action: () => navigate("/admin/users"),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px" }}>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Dashboard sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Admin Dashboard
            </Typography>
            <Typography variant="body1" opacity={0.9}>
              Manage your SaaS application from this central control panel
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                      component="span"
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          component="div"
        >
          Commonly used administrative tasks
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: `${action.color}.main`,
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                    {React.cloneElement(action.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {action.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    color={action.color as any}
                    onClick={action.action}
                    size="small"
                  >
                    Go to {action.title.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          component="div"
        >
          Latest system events and changes
        </Typography>

        <Stack spacing={2}>
          {[
            {
              action: 'New module "Payment Gateway" created',
              time: "2 hours ago",
              type: "module",
            },
            {
              action: 'Subscription plan "Premium" updated',
              time: "4 hours ago",
              type: "subscription",
            },
            {
              action: "15 new users registered",
              time: "6 hours ago",
              type: "user",
            },
            {
              action: "System backup completed",
              time: "1 day ago",
              type: "system",
            },
          ].map((activity, index) => (
            <Box key={index}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">{activity.action}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Stack>
              {index < 3 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminOverview;
