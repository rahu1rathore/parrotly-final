import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Avatar,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { Module, ModuleFormData, FilterStatus } from "../types";
import { moduleAPI, mockModules } from "../services/api";

interface ModuleManagementProps {
  onModulesChange?: () => void;
}

const ModuleManagement: React.FC<ModuleManagementProps> = ({
  onModulesChange,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<ModuleFormData>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load modules on component mount
  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Use mock data for now - replace with actual API call
      // const response = await moduleAPI.getAll();
      // setModules(response.data);
      setModules(mockModules);
    } catch (error) {
      showSnackbar("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search modules
  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch = module.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && module.is_active) ||
        (filterStatus === "inactive" && !module.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [modules, searchTerm, filterStatus]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDialogOpen = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        description: module.description || "",
      });
    } else {
      setEditingModule(null);
      setFormData({ name: "", description: "" });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingModule(null);
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ModuleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Module name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingModule) {
        // Update existing module
        const updatedModule = {
          ...editingModule,
          name: formData.name.trim(),
          description: formData.description.trim(),
          updated_at: new Date().toISOString(),
        };

        setModules(
          modules.map((m) => (m.id === editingModule.id ? updatedModule : m)),
        );
        showSnackbar("Module updated successfully", "success");
      } else {
        // Create new module
        const newModule: Module = {
          id: Date.now().toString(), // Mock ID - use proper UUID in production
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: true,
          created_at: new Date().toISOString(),
        };

        setModules([...modules, newModule]);
        showSnackbar("Module created successfully", "success");
      }

      handleDialogClose();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to save module", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (module: Module) => {
    setLoading(true);
    try {
      const updatedModule = {
        ...module,
        is_active: !module.is_active,
        updated_at: new Date().toISOString(),
      };

      setModules(modules.map((m) => (m.id === module.id ? updatedModule : m)));
      showSnackbar(
        `Module ${updatedModule.is_active ? "activated" : "deactivated"} successfully`,
        "success",
      );
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to update module status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1" fontWeight={600}>
          Recent Modules
        </Typography>
        <Link
          component="button"
          variant="body2"
          onClick={() => handleDialogOpen()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            textDecoration: "none",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View All
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </Box>

      {/* Modules Table */}
      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Module Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Users
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Active
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Created Date
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModules.map((module, index) => {
              const moduleColors = [
                "#1976d2",
                "#388e3c",
                "#f57c00",
                "#d32f2f",
                "#7b1fa2",
              ];
              const moduleAvatarColor =
                moduleColors[index % moduleColors.length];
              const userCount = Math.floor(Math.random() * 500) + 10;
              const categories = [
                "Core",
                "Analytics",
                "Sales",
                "Support",
                "Marketing",
              ];
              const category = categories[index % categories.length];

              return (
                <TableRow
                  key={module.id}
                  hover
                  sx={{ "&:hover": { backgroundColor: "grey.50" } }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: moduleAvatarColor,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {module.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {module.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {userCount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={module.is_active ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: module.is_active
                          ? "#e3f2fd"
                          : "#f5f5f5",
                        color: module.is_active ? "#1976d2" : "#757575",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {module.is_active ? "100%" : "0%"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(
                        module.created_at || "2023-10-01",
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen(module)}
                      disabled={loading}
                      sx={{ color: "text.secondary" }}
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredModules.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    py={4}
                    component="div"
                  >
                    {searchTerm || filterStatus !== "all"
                      ? "No modules found matching your criteria"
                      : "No modules available. Create your first module to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Hidden Filters - Can be toggled via View All */}
      <Box sx={{ display: "none" }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search modules"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                >
                  <MenuItem value="all">All Modules</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadModules}
                disabled={loading}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingModule ? "Edit Module" : "Create New Module"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Module Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
              placeholder="Optional description of the module..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingModule ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModuleManagement;
