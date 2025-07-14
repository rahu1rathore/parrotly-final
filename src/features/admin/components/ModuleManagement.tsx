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
  TablePagination,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Stack,
  Toolbar,
  Fade,
  Backdrop,
  Checkbox,
  Tooltip,
  LinearProgress,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Sort as SortIcon,
  SelectAll as SelectAllIcon,
  DeleteSweep as BulkDeleteIcon,
  Edit as BulkEditIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Module, ModuleFormData, FilterStatus } from "../types";
import { moduleAPI, mockModules } from "../services/api";

interface ModuleManagementProps {
  onModulesChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterState {
  search: string;
  status: FilterStatus;
  category: string;
  createdAfter: string;
  createdBefore: string;
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

interface ModuleSummary {
  totalModules: number;
  activeModules: number;
  inactiveModules: number;
  categories: { [key: string]: number };
}

const ModuleManagement: React.FC<ModuleManagementProps> = ({
  onModulesChange,
}) => {
  // Data state
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    category: "all",
  });

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Selected items
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);

  // Form state
  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<ModuleFormData>>({});

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleForMenu, setSelectedModuleForMenu] =
    useState<Module | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Categories for filtering
  const categories = ["Core", "Analytics", "Sales", "Support", "Marketing"];

  // Load modules on component mount and when filters/pagination change
  useEffect(() => {
    loadModules();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Simulate API call with filters and pagination
      // In real implementation, pass filters and pagination to API
      let filteredData = [...mockModules];

      // Apply filters
      if (filters.search) {
        filteredData = filteredData.filter(
          (module) =>
            module.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            (module.description &&
              module.description
                .toLowerCase()
                .includes(filters.search.toLowerCase())),
        );
      }

      if (filters.status !== "all") {
        filteredData = filteredData.filter((module) =>
          filters.status === "active" ? module.is_active : !module.is_active,
        );
      }

      // For demo, we'll simulate categories
      if (filters.category !== "all") {
        filteredData = filteredData.filter(
          (_, index) =>
            categories[index % categories.length] === filters.category,
        );
      }

      const total = filteredData.length;
      const startIndex = pagination.page * pagination.rowsPerPage;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pagination.rowsPerPage,
      );

      setModules(paginatedData);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      showSnackbar("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      category: "all",
    });
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  // Action menu handlers
  const handleActionClick = (
    event: React.MouseEvent<HTMLElement>,
    module: Module,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedModuleForMenu(module);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedModuleForMenu(null);
  };

  const handleView = () => {
    if (selectedModuleForMenu) {
      setViewingModule(selectedModuleForMenu);
      setViewDialogOpen(true);
    }
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedModuleForMenu) {
      setEditingModule(selectedModuleForMenu);
      setFormData({
        name: selectedModuleForMenu.name,
        description: selectedModuleForMenu.description || "",
      });
      setEditDialogOpen(true);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (selectedModuleForMenu) {
      setDeletingModule(selectedModuleForMenu);
      setDeleteDialogOpen(true);
    }
    handleActionClose();
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<ModuleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Module name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Module name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newModule: Module = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await moduleAPI.create(newModule);

      showSnackbar("Module created successfully", "success");
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to create module", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingModule) return;

    setLoading(true);
    try {
      const updatedModule = {
        ...editingModule,
        name: formData.name.trim(),
        description: formData.description.trim(),
        updated_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await moduleAPI.update(editingModule.id, updatedModule);

      showSnackbar("Module updated successfully", "success");
      setEditDialogOpen(false);
      setEditingModule(null);
      setFormData({ name: "", description: "" });
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to update module", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingModule) return;

    setLoading(true);
    try {
      // In real app, make API call
      // await moduleAPI.delete(deletingModule.id);

      showSnackbar("Module deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDeletingModule(null);
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to delete module", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (module: Module) => {
    setLoading(true);
    try {
      // In real app, make API call
      // await moduleAPI.update(module.id, { is_active: !module.is_active });

      showSnackbar(
        `Module ${!module.is_active ? "activated" : "deactivated"} successfully`,
        "success",
      );
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to update module status", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get module category
  const getModuleCategory = (index: number) => {
    return categories[index % categories.length];
  };

  // Helper function to get avatar color
  const getAvatarColor = (index: number) => {
    const colors = ["#1976d2", "#388e3c", "#f57c00", "#d32f2f", "#7b1fa2"];
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ width: "100%", p: 0, m: 0 }}>
      {/* Create Button */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          size="large"
        >
          Create Module
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <FilterListIcon color="action" />
            <Typography variant="h6">Filters</Typography>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={
                filters.search === "" &&
                filters.status === "all" &&
                filters.category === "all"
              }
            >
              Clear All
            </Button>
          </Stack>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search modules"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by name or description..."
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
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
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card sx={{ boxShadow: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Module Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography>Loading modules...</Typography>
                  </TableCell>
                </TableRow>
              ) : modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {Object.values(filters).some(
                        (f) => f !== "all" && f !== "",
                      )
                        ? "No modules found matching your criteria"
                        : "No modules available. Create your first module to get started."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((module, index) => {
                  const globalIndex =
                    pagination.page * pagination.rowsPerPage + index;
                  const category = getModuleCategory(globalIndex);
                  const avatarColor = getAvatarColor(globalIndex);

                  return (
                    <TableRow
                      key={module.id}
                      hover
                      sx={{ "&:hover": { backgroundColor: "grey.50" } }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: avatarColor,
                              fontSize: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            {module.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {module.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {module.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={category}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {module.description || "No description provided"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={module.is_active ? "Active" : "Inactive"}
                          size="small"
                          color={module.is_active ? "success" : "default"}
                          onClick={() => handleToggleActive(module)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                          }}
                        />
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

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, module)}
                          sx={{ color: "text.secondary" }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showFirstButton
          showLastButton
        />
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 160 },
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Module Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
          <Button onClick={() => setCreateDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
            Create Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Module</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
          <Button onClick={() => setEditDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" disabled={loading}>
            Update Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Module Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Module Details</DialogTitle>
        <DialogContent>
          {viewingModule && (
            <Box sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Module Name
                  </Typography>
                  <Typography variant="body1">{viewingModule.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {viewingModule.description || "No description provided"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={viewingModule.is_active ? "Active" : "Inactive"}
                    color={viewingModule.is_active ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(
                      viewingModule.created_at || "",
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the module "{deletingModule?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            Delete
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
