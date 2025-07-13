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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
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
        <Typography variant="h4" component="h1" fontWeight="bold">
          Module Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
          size="large"
        >
          Add Module
        </Button>
      </Box>

      {/* Filters and Search */}
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

      {/* Modules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Module Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModules.map((module) => (
              <TableRow key={module.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {module.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {module.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={module.is_active ? "Active" : "Inactive"}
                    color={module.is_active ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={module.is_active}
                        onChange={() => handleToggleActive(module)}
                        disabled={loading}
                      />
                    }
                    label=""
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleDialogOpen(module)}
                    disabled={loading}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredModules.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
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
