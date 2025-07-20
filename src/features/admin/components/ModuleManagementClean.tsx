import React, { useState, useEffect } from "react";
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
  Menu,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Stack,
  Checkbox,
  Switch,
  FormControlLabel,
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
  DeleteSweep as BulkDeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Category as CategoryIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Store as StoreIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Module, ModuleFormData, FilterStatus } from "../types";
import { moduleAPI } from "../services/api";

interface ModuleManagementCleanProps {
  onModulesChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  status: FilterStatus;
  category: string;
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

const ModuleManagementClean: React.FC<ModuleManagementCleanProps> = ({
  onModulesChange,
}) => {
  // Core state
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [categories] = useState<string[]>([
    "Core",
    "Communication", 
    "Analytics",
    "E-commerce",
    "Productivity"
  ]);

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
    category: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // UI state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Modal states
  const [dialogs, setDialogs] = useState({
    create: false,
    edit: false,
    delete: false,
    view: false,
    bulkDelete: false,
  });

  // Form state
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<ModuleFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleForMenu, setSelectedModuleForMenu] = useState<Module | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadModules();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // API functions
  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: filters.search,
        status: filters.status,
        category: filters.category,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      const response = await moduleAPI.getAll(params);
      setModules(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Error loading modules:", error);
      setError("Failed to load modules. Please try again.");
      showSnackbar("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      category: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSort = (sortBy: FilterState["sortBy"]) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: newSortOrder }));
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

  const handleSelectAll = () => {
    if (selectedModules.length === modules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(modules.map((m) => m.id));
    }
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, module: Module) => {
    setAnchorEl(event.currentTarget);
    setSelectedModuleForMenu(module);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedModuleForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedModuleForMenu) {
      setViewingModule(selectedModuleForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedModuleForMenu) {
      openEditDialog(selectedModuleForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedModuleForMenu) {
      setViewingModule(selectedModuleForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateModule = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }

      await moduleAPI.create(formData);
      showSnackbar("Module created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ name: "", description: "" });
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to create module", "error");
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }

      await moduleAPI.update(editingModule.id, formData);
      showSnackbar("Module updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingModule(null);
      setFormData({ name: "", description: "" });
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to update module", "error");
    }
  };

  const handleDeleteModule = async (module: Module) => {
    try {
      await moduleAPI.delete(module.id);
      showSnackbar("Module deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to delete module", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await moduleAPI.bulkDelete(selectedModules);
      showSnackbar(
        `${selectedModules.length} modules deleted successfully`,
        "success",
      );
      setSelectedModules([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to delete modules", "error");
    }
  };

  const handleToggleActive = async (module: Module) => {
    try {
      await moduleAPI.toggleActive(module.id, !module.is_active);
      showSnackbar(
        `Module ${!module.is_active ? "activated" : "deactivated"} successfully`,
        "success",
      );
      loadModules();
      onModulesChange?.();
    } catch (error) {
      showSnackbar("Failed to update module status", "error");
    }
  };

  const openEditDialog = (module: Module) => {
    setEditingModule(module);
    setFormData({ name: module.name, description: module.description || "" });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Core":
        return <SecurityIcon />;
      case "Communication":
        return <CategoryIcon />;
      case "Analytics":
        return <AnalyticsIcon />;
      case "E-commerce":
        return <StoreIcon />;
      case "Productivity":
        return <WorkIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Core":
        return "#f44336";
      case "Communication":
        return "#2196f3";
      case "Analytics":
        return "#ff9800";
      case "E-commerce":
        return "#4caf50";
      case "Productivity":
        return "#9c27b0";
      default:
        return "#757575";
    }
  };

  const getModuleCategory = (index: number): string => {
    return categories[index % categories.length];
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Modules", status: "all" as FilterStatus },
    { label: "Active", status: "active" as FilterStatus },
    { label: "Inactive", status: "inactive" as FilterStatus },
  ];

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Separated Filter Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <Stack spacing={3}>
              {/* Filter Header */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <FilterListIcon className="text-gray-600" />
                <Typography variant="h6" className="text-gray-800">
                  Filters
                </Typography>
              </Stack>

              {/* Quick Filters */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" className="text-gray-600 font-medium">
                  Quick Filter:
                </Typography>
                {quickFilters.map((filter) => (
                  <button
                    key={filter.status}
                    onClick={() => handleFilterChange("status", filter.status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.status === filter.status
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </Stack>

              {/* Advanced Filters */}
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search modules..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    className="bg-white"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      label="Category"
                      className="bg-white"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {getCategoryIcon(category)}
                            <span>{category}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      label="Sort By"
                      className="bg-white"
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="created_at">Created Date</MenuItem>
                      <MenuItem value="updated_at">Updated Date</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                      label="Order"
                      className="bg-white"
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    size="small"
                    className="h-10"
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Main Table Section */}
        <Paper className="shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h5" className="text-gray-900 font-semibold">
                  Module Management
                </Typography>
                <Typography variant="body2" className="text-gray-600 mt-1">
                  Manage and configure system modules
                </Typography>
              </div>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData({ name: "", description: "" });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Module
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadModules}
                  disabled={loading}
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  disabled={modules.length === 0}
                >
                  Export
                </Button>

                {selectedModules.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BulkDeleteIcon />}
                    onClick={() =>
                      setDialogs((prev) => ({ ...prev, bulkDelete: true }))
                    }
                  >
                    Delete ({selectedModules.length})
                  </Button>
                )}
              </Stack>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="m-4">
              {error}
            </Alert>
          )}

          {/* Table */}
          <TableContainer className="max-h-96 overflow-auto">
            <Table stickyHeader>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        modules.length > 0 &&
                        selectedModules.length === modules.length
                      }
                      indeterminate={
                        selectedModules.length > 0 &&
                        selectedModules.length < modules.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("name")}
                      className="font-semibold text-gray-700"
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Description</TableCell>
                  <TableCell className="font-semibold text-gray-700">Category</TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "created_at"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("created_at")}
                      className="font-semibold text-gray-700"
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "updated_at"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("updated_at")}
                      className="font-semibold text-gray-700"
                    >
                      Updated
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module, index) => {
                  const category = getModuleCategory(index);
                  return (
                    <TableRow
                      key={module.id}
                      selected={selectedModules.includes(module.id)}
                      hover
                      className="hover:bg-gray-50"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedModules.includes(module.id)}
                          onChange={() => handleSelectModule(module.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" className="font-medium text-gray-900">
                          {module.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {module.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: getCategoryColor(category) }}
                          >
                            {getCategoryIcon(category)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={module.is_active}
                              onChange={() => handleToggleActive(module)}
                              size="small"
                            />
                          }
                          label={
                            <span className={`text-sm font-medium ${
                              module.is_active ? "text-green-600" : "text-gray-500"
                            }`}>
                              {module.is_active ? "Active" : "Inactive"}
                            </span>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {module.created_at
                            ? format(new Date(module.created_at), "MMM dd, yyyy")
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {module.updated_at
                            ? format(new Date(module.updated_at), "MMM dd, yyyy")
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, module)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {modules.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12">
                      <div className="text-center">
                        <CategoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No modules found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first module
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
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
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            showFirstButton
            showLastButton
            className="border-t border-gray-200"
          />
        </Paper>

        {/* Actions Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
          className="mt-2"
        >
          <MenuItem onClick={handleViewAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <ViewIcon fontSize="small" className="text-blue-600" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <EditIcon fontSize="small" className="text-yellow-600" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <DeleteIcon fontSize="small" className="text-red-600" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create Dialog */}
        <Dialog
          open={dialogs.create}
          onClose={() => setDialogs((prev) => ({ ...prev, create: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Module</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Module Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              className="mb-4"
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateModule} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={dialogs.edit}
          onClose={() => setDialogs((prev) => ({ ...prev, edit: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Module</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Module Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              className="mb-4"
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateModule} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={dialogs.view}
          onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Module Details</DialogTitle>
          <DialogContent>
            {viewingModule && (
              <Stack spacing={3}>
                <TextField
                  label="Name"
                  value={viewingModule.name}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Description"
                  value={viewingModule.description || "No description"}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Status"
                      value={viewingModule.is_active ? "Active" : "Inactive"}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Category"
                      value={getModuleCategory(
                        modules.findIndex((m) => m.id === viewingModule.id),
                      )}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Created"
                      value={
                        viewingModule.created_at
                          ? format(new Date(viewingModule.created_at), "PPP")
                          : "—"
                      }
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Updated"
                      value={
                        viewingModule.updated_at
                          ? format(new Date(viewingModule.updated_at), "PPP")
                          : "—"
                      }
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, view: false }))}
            >
              Close
            </Button>
            {viewingModule && (
              <Button
                onClick={() => openEditDialog(viewingModule)}
                variant="contained"
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={dialogs.delete}
          onClose={() => setDialogs((prev) => ({ ...prev, delete: false }))}
        >
          <DialogTitle>Delete Module</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingModule?.name}"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, delete: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={() => viewingModule && handleDeleteModule(viewingModule)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog
          open={dialogs.bulkDelete}
          onClose={() => setDialogs((prev) => ({ ...prev, bulkDelete: false }))}
        >
          <DialogTitle>Delete Selected Modules</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedModules.length} selected
              modules? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDialogs((prev) => ({ ...prev, bulkDelete: false }))
              }
            >
              Cancel
            </Button>
            <Button onClick={handleBulkDelete} color="error" variant="contained">
              Delete {selectedModules.length} Modules
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
};

export default ModuleManagementClean;
