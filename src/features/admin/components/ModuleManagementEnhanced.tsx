import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  Card,
  CardContent,
  Stack,
  Toolbar,
  Checkbox,
  Tooltip,
  LinearProgress,
  TableSortLabel,
  Collapse,
  Fab,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
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
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ExpandMore as ExpandMoreIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Store as StoreIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { format, subDays } from "date-fns";
import { Module, ModuleFormData, FilterStatus } from "../types";
import { moduleAPI } from "../services/api";

interface ModuleManagementEnhancedProps {
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

type ViewMode = "table" | "grid";

const ModuleManagementEnhanced: React.FC<ModuleManagementEnhancedProps> = ({
  onModulesChange,
}) => {
  // Core state
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [summary, setSummary] = useState<ModuleSummary | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    category: "",
    createdAfter: "",
    createdBefore: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // UI state
  const [filterExpanded, setFilterExpanded] = useState(false);
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
    export: false,
  });

  // Form state
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<ModuleFormData>>({});

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleForMenu, setSelectedModuleForMenu] =
    useState<Module | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadModules();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  useEffect(() => {
    loadCategories();
  }, []);

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
        created_after: filters.createdAfter,
        created_before: filters.createdBefore,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      const response = await moduleAPI.getAll(params);

      setModules(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.total_pages,
        hasNext: response.pagination.has_next,
        hasPrev: response.pagination.has_prev,
      }));
      setSummary(response.summary);
    } catch (error) {
      console.error("Error loading modules:", error);
      setError("Failed to load modules. Please try again.");
      showSnackbar("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await moduleAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
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
      createdAfter: "",
      createdBefore: "",
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

  const handleExport = async (format: "csv" | "excel" | "json") => {
    try {
      setExporting(true);
      const response = await moduleAPI.export(format, filters);
      showSnackbar(`Export started. Download will begin shortly.`, "info");

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = `modules-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

      setDialogs((prev) => ({ ...prev, export: false }));
    } catch (error) {
      showSnackbar("Failed to export modules", "error");
    } finally {
      setExporting(false);
    }
  };

  const openEditDialog = (module: Module) => {
    setEditingModule(module);
    setFormData({ name: module.name, description: module.description || "" });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const openViewDialog = (module: Module) => {
    setViewingModule(module);
    setDialogs((prev) => ({ ...prev, view: true }));
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
    const cats = [
      "Core",
      "Communication",
      "Analytics",
      "E-commerce",
      "Productivity",
    ];
    return cats[index % cats.length];
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Modules", status: "all" as FilterStatus, color: "default" },
    { label: "Active", status: "active" as FilterStatus, color: "success" },
    { label: "Inactive", status: "inactive" as FilterStatus, color: "error" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <CategoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{summary.totalModules}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Modules
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <ActiveIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.activeModules}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Modules
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "error.main" }}>
                    <InactiveIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.inactiveModules}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inactive Modules
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <SpeedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {Math.round(
                        (summary.activeModules / summary.totalModules) * 100,
                      )}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Rate
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {/* Toolbar */}
        <Toolbar sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Module Management
            {summary && (
              <Chip
                label={`${summary.totalModules} modules`}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="table">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormData({ name: "", description: "" });
                setFormErrors({});
                setDialogs((prev) => ({ ...prev, create: true }));
              }}
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
              onClick={() => setDialogs((prev) => ({ ...prev, export: true }))}
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
        </Toolbar>

        {/* Quick Status Filters */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Quick Filter:
            </Typography>
            {quickFilters.map((filter) => (
              <Chip
                key={filter.status}
                label={filter.label}
                clickable
                color={filters.status === filter.status ? "primary" : "default"}
                variant={
                  filters.status === filter.status ? "filled" : "outlined"
                }
                onClick={() => handleFilterChange("status", filter.status)}
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {/* Advanced Filters */}
        <Accordion
          expanded={filterExpanded}
          onChange={() => setFilterExpanded(!filterExpanded)}
          sx={{ boxShadow: "none", "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterListIcon />
              <Typography>Advanced Filters</Typography>
              {(filters.search ||
                filters.category ||
                filters.createdAfter ||
                filters.createdBefore) && (
                <Chip label="Active" size="small" color="primary" />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search modules..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    label="Category"
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
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    label="Sort By"
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
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                    label="Order"
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
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Loading Progress */}
        {loading && <LinearProgress />}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "created_at"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("created_at")}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "updated_at"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("updated_at")}
                    >
                      Updated
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
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
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedModules.includes(module.id)}
                          onChange={() => handleSelectModule(module.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {module.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {module.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getCategoryIcon(category)}
                          label={category}
                          size="small"
                          sx={{
                            bgcolor: getCategoryColor(category) + "20",
                            color: getCategoryColor(category),
                            border: `1px solid ${getCategoryColor(category)}40`,
                          }}
                        />
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
                            <Chip
                              label={module.is_active ? "Active" : "Inactive"}
                              size="small"
                              color={module.is_active ? "success" : "default"}
                              variant="outlined"
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {module.created_at
                            ? format(
                                new Date(module.created_at),
                                "MMM dd, yyyy",
                              )
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {module.updated_at
                            ? format(
                                new Date(module.updated_at),
                                "MMM dd, yyyy",
                              )
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => openViewDialog(module)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Module">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(module)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Module">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setViewingModule(module);
                                setDialogs((prev) => ({
                                  ...prev,
                                  delete: true,
                                }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {modules.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No modules found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {modules.map((module, index) => {
                const category = getModuleCategory(index);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
                    <Card
                      sx={{
                        height: "100%",
                        border: selectedModules.includes(module.id) ? 2 : 0,
                        borderColor: "primary.main",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Checkbox
                              checked={selectedModules.includes(module.id)}
                              onChange={() => handleSelectModule(module.id)}
                              size="small"
                            />
                            <Avatar
                              sx={{
                                bgcolor: getCategoryColor(category),
                                width: 32,
                                height: 32,
                              }}
                            >
                              {getCategoryIcon(category)}
                            </Avatar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                              {module.name}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            {module.description || "No description"}
                          </Typography>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Chip
                              label={category}
                              size="small"
                              sx={{
                                bgcolor: getCategoryColor(category) + "20",
                                color: getCategoryColor(category),
                              }}
                            />
                            <Chip
                              label={module.is_active ? "Active" : "Inactive"}
                              size="small"
                              color={module.is_active ? "success" : "default"}
                            />
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            Created:{" "}
                            {module.created_at
                              ? format(
                                  new Date(module.created_at),
                                  "MMM dd, yyyy",
                                )
                              : "—"}
                          </Typography>

                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => openViewDialog(module)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openEditDialog(module)}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              {modules.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No modules found
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

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
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog
        open={dialogs.create}
        onClose={() => setDialogs((prev) => ({ ...prev, create: false }))}
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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
      >
        <DialogTitle>Module Details</DialogTitle>
        <DialogContent>
          {viewingModule && (
            <Stack spacing={2}>
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
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Status"
                  value={viewingModule.is_active ? "Active" : "Inactive"}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Category"
                  value={getModuleCategory(
                    modules.findIndex((m) => m.id === viewingModule.id),
                  )}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Created"
                  value={
                    viewingModule.created_at
                      ? format(new Date(viewingModule.created_at), "PPP")
                      : "—"
                  }
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Updated"
                  value={
                    viewingModule.updated_at
                      ? format(new Date(viewingModule.updated_at), "PPP")
                      : "—"
                  }
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Stack>
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

      {/* Export Dialog */}
      <Dialog
        open={dialogs.export}
        onClose={() => setDialogs((prev) => ({ ...prev, export: false }))}
      >
        <DialogTitle>Export Modules</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for exporting modules:
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleExport("csv")}
              disabled={exporting}
              fullWidth
            >
              Export as CSV
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport("excel")}
              disabled={exporting}
              fullWidth
            >
              Export as Excel
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport("json")}
              disabled={exporting}
              fullWidth
            >
              Export as JSON
            </Button>
          </Stack>
          {exporting && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary">
                Preparing export...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, export: false }))}
          >
            Cancel
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

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={() => {
          setFormData({ name: "", description: "" });
          setFormErrors({});
          setDialogs((prev) => ({ ...prev, create: true }));
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ModuleManagementEnhanced;
