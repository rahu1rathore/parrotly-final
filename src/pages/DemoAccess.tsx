import React from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminAccessInfo from "../components/common/AdminAccessInfo";

const DemoAccess: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickAdminAccess = () => {
    // Set demo admin authentication
    localStorage.setItem("authToken", "admin-demo-token-" + Date.now());
    localStorage.setItem("userEmail", "admin@demo.com");
    navigate("/admin");
  };

  const handleDashboardAccess = () => {
    // Set demo user authentication
    localStorage.setItem("authToken", "user-demo-token-" + Date.now());
    localStorage.setItem("userEmail", "user@demo.com");
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          SaaS Demo Access
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Explore the admin panel and dashboard features
        </Typography>
        <Chip
          label="Demo Environment"
          color="primary"
          variant="outlined"
          size="medium"
        />
      </Box>

      {/* Quick Access Cards */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              border: "2px solid",
              borderColor: "secondary.light",
              "&:hover": {
                borderColor: "secondary.main",
                transform: "translateY(-4px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <AdminIcon
                sx={{ fontSize: 64, color: "secondary.main", mb: 2 }}
              />
              <Typography variant="h5" component="h2" gutterBottom>
                Admin Panel
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Access the complete admin interface to manage modules and
                subscriptions
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                <Chip label="Module Management" size="small" />
                <Chip label="Subscriptions" size="small" />
                <Chip label="CRUD Operations" size="small" />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AdminIcon />}
                onClick={handleQuickAdminAccess}
              >
                Access Admin Panel
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              border: "2px solid",
              borderColor: "primary.light",
              "&:hover": {
                borderColor: "primary.main",
                transform: "translateY(-4px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <DashboardIcon
                sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h5" component="h2" gutterBottom>
                CRM Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Explore the main application dashboard with CRM features
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                <Chip label="Analytics" size="small" />
                <Chip label="Customer Data" size="small" />
                <Chip label="Reports" size="small" />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={handleDashboardAccess}
              >
                Access Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Alternative Access Methods */}
      <AdminAccessInfo />

      {/* Navigation Options */}
      <Box textAlign="center" mt={6}>
        <Typography variant="h6" gutterBottom>
          Alternative Access Methods
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={() => navigate("/login")}
          >
            Sign In Page
          </Button>
          <Button
            variant="outlined"
            startIcon={<SpeedIcon />}
            onClick={() => navigate("/marketing")}
          >
            Marketing Page
          </Button>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Home
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default DemoAccess;
