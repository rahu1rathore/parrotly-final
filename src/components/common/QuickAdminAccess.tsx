import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const QuickAdminAccess: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleAdminAccess = () => {
    // Check if user is already authenticated
    const token = localStorage.getItem("authToken");

    if (token) {
      // Already authenticated, go to admin
      navigate("/admin");
    } else {
      // Show login dialog or redirect to login
      setOpen(true);
    }
  };

  const handleDemoLogin = () => {
    // Demo admin login
    localStorage.setItem("authToken", "admin-demo-token-" + Date.now());
    localStorage.setItem("userEmail", "admin@demo.com");
    setOpen(false);
    navigate("/admin");
  };

  const handleGoToLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  return (
    <>
      <Tooltip title="Admin Panel Access" placement="left">
        <Fab
          color="secondary"
          aria-label="admin-access"
          onClick={handleAdminAccess}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AdminPanelSettingsIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Admin Panel Access</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              You need to be logged in to access the admin panel.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can either sign in with your credentials or use demo access
              for testing.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleGoToLogin} variant="outlined">
            Go to Sign In
          </Button>
          <Button
            onClick={handleDemoLogin}
            variant="contained"
            color="secondary"
          >
            Demo Admin Access
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickAdminAccess;
