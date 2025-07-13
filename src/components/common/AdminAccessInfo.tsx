import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AdminAccessInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Box textAlign="center" mb={3}>
        <AdminIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Admin Panel Access
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Multiple ways to access the admin panel for testing
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <LoginIcon color="primary" />
            Sign In Page Access
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Go to the sign in page and use the "Admin Demo Access" button for
            instant access.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            fullWidth
          >
            Go to Sign In
          </Button>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="h6"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <SecurityIcon color="secondary" />
            Demo Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use any email address and password (minimum 6 characters) on the
            sign in form.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label="Email: any@example.com"
              size="small"
              variant="outlined"
            />
            <Chip label="Password: 123456+" size="small" variant="outlined" />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" gutterBottom>
            Quick Access Features
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Look for the floating admin button (bottom-right) on any page for
            quick access.
          </Typography>
        </Box>
      </Stack>

      <Box mt={3} p={2} bgcolor="action.hover" borderRadius={1}>
        <Typography variant="caption" display="block" textAlign="center">
          <strong>Note:</strong> This is a demo environment. All data is stored
          locally and will reset on page refresh.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AdminAccessInfo;
