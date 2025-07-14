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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CardActions,
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
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Extension as ModuleIcon,
  ExpandMore as ExpandMoreIcon,
  GridView as GridViewIcon,
  ViewList,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Diamond as DiamondIcon,
} from "@mui/icons-material";
import { format, addDays } from "date-fns";
import {
  Subscription,
  SubscriptionFormData,
  ModulePermission,
  Module,
} from "../types";
import { subscriptionAPI, moduleAPI } from "../services/api";

interface SubscriptionManagementEnhancedProps {
  onSubscriptionsChange?: () => void;
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
  priceMin: number | "";
  priceMax: number | "";
  validityMin: number | "";
  validityMax: number | "";
  planType: "all" | "basic" | "pro" | "enterprise";
  createdAfter: string;
  createdBefore: string;
  sortBy: "name" | "price" | "validity" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

interface SubscriptionSummary {
  totalSubscriptions: number;
  avgPrice: number;
  avgValidity: number;
  planDistribution: { [key: string]: number };
  priceRanges: {
    basic: { min: number; max: number; count: number };
    mid: { min: number; max: number; count: number };
    premium: { min: number; max: number; count: number };
  };
}

type ViewMode = "table" | "grid";

const SubscriptionManagementEnhanced: React.FC<
  SubscriptionManagementEnhancedProps
> = ({ onSubscriptionsChange }) => {
  // Core state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>(
    [],
  );
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [planTypes, setPlanTypes] = useState<string[]>([]);
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
    priceMin: "",
    priceMax: "",
    validityMin: "",
    validityMax: "",
    planType: "all",
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
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    description: "",
    price: 0,
    validity: 30,
    modules: [],
  });
  const [formErrors, setFormErrors] = useState<Partial<SubscriptionFormData>>(
    {},
  );
  const [activeStep, setActiveStep] = useState(0);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSubscriptionForMenu, setSelectedSubscriptionForMenu] =
    useState<Subscription | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadSubscriptions();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  useEffect(() => {
    loadPlanTypes();
    loadModules();
  }, []);

  // API functions
  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: filters.search,
        price_min:
          filters.priceMin !== "" ? Number(filters.priceMin) : undefined,
        price_max:
          filters.priceMax !== "" ? Number(filters.priceMax) : undefined,
        validity_min:
          filters.validityMin !== "" ? Number(filters.validityMin) : undefined,
        validity_max:
          filters.validityMax !== "" ? Number(filters.validityMax) : undefined,
        plan_type: filters.planType,
        created_after: filters.createdAfter,
        created_before: filters.createdBefore,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      const response = await subscriptionAPI.getAll(params);

      setSubscriptions(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.total_pages,
        hasNext: response.pagination.has_next,
        hasPrev: response.pagination.has_prev,
      }));
      setSummary(response.summary);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      setError("Failed to load subscriptions. Please try again.");
      showSnackbar("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPlanTypes = async () => {
    try {
      const response = await subscriptionAPI.getPlanTypes();
      setPlanTypes(response.data);
    } catch (error) {
      console.error("Error loading plan types:", error);
    }
  };

  const loadModules = async () => {
    try {
      const response = await moduleAPI.getActive();
      setModules(response.data || []);
    } catch (error) {
      console.error("Error loading modules:", error);
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
      priceMin: "",
      priceMax: "",
      validityMin: "",
      validityMax: "",
      planType: "all",
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
    if (selectedSubscriptions.length === subscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(subscriptions.map((s) => s.id));
    }
  };

  const handleSelectSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions((prev) =>
      prev.includes(subscriptionId)
        ? prev.filter((id) => id !== subscriptionId)
        : [...prev, subscriptionId],
    );
  };

  const handleCreateSubscription = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.price || formData.price <= 0) {
        setFormErrors({ price: "Valid price is required" });
        return;
      }

      await subscriptionAPI.create(formData);
      showSnackbar("Subscription created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      resetForm();
      loadSubscriptions();
      onSubscriptionsChange?.();
    } catch (error) {
      showSnackbar("Failed to create subscription", "error");
    }
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.price || formData.price <= 0) {
        setFormErrors({ price: "Valid price is required" });
        return;
      }

      await subscriptionAPI.update(editingSubscription.id, formData);
      showSnackbar("Subscription updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingSubscription(null);
      resetForm();
      loadSubscriptions();
      onSubscriptionsChange?.();
    } catch (error) {
      showSnackbar("Failed to update subscription", "error");
    }
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    try {
      await subscriptionAPI.delete(subscription.id);
      showSnackbar("Subscription deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadSubscriptions();
      onSubscriptionsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete subscription", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await subscriptionAPI.bulkDelete(selectedSubscriptions);
      showSnackbar(
        `${selectedSubscriptions.length} subscriptions deleted successfully`,
        "success",
      );
      setSelectedSubscriptions([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadSubscriptions();
      onSubscriptionsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete subscriptions", "error");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "json") => {
    try {
      setExporting(true);
      const response = await subscriptionAPI.export(format, filters);
      showSnackbar(`Export started. Download will begin shortly.`, "info");

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = `subscriptions-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

      setDialogs((prev) => ({ ...prev, export: false }));
    } catch (error) {
      showSnackbar("Failed to export subscriptions", "error");
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      validity: 30,
      modules: [],
    });
    setFormErrors({});
    setActiveStep(0);
  };

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      description: subscription.description || "",
      price: subscription.price,
      validity: subscription.validity,
      modules: subscription.modules,
    });
    setFormErrors({});
    setActiveStep(0);
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const openViewDialog = (subscription: Subscription) => {
    setViewingSubscription(subscription);
    setDialogs((prev) => ({ ...prev, view: true }));
  };

  const getPlanTypeIcon = (planName: string) => {
    const planLower = planName.toLowerCase();
    if (planLower.includes("basic") || planLower.includes("starter"))
      return <StarIcon />;
    if (planLower.includes("pro") || planLower.includes("team"))
      return <BusinessIcon />;
    if (planLower.includes("enterprise") || planLower.includes("premium"))
      return <DiamondIcon />;
    return <GroupIcon />;
  };

  const getPlanTypeColor = (planName: string) => {
    const planLower = planName.toLowerCase();
    if (planLower.includes("basic") || planLower.includes("starter"))
      return "#4caf50";
    if (planLower.includes("pro") || planLower.includes("team"))
      return "#2196f3";
    if (planLower.includes("enterprise") || planLower.includes("premium"))
      return "#9c27b0";
    return "#ff9800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatValidity = (validity: number) => {
    if (validity >= 365) {
      return `${Math.floor(validity / 365)} year${Math.floor(validity / 365) > 1 ? "s" : ""}`;
    } else if (validity >= 30) {
      return `${Math.floor(validity / 30)} month${Math.floor(validity / 30) > 1 ? "s" : ""}`;
    } else {
      return `${validity} day${validity > 1 ? "s" : ""}`;
    }
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Plans", planType: "all" as const, color: "default" },
    { label: "Basic", planType: "basic" as const, color: "success" },
    { label: "Pro", planType: "pro" as const, color: "primary" },
    {
      label: "Enterprise",
      planType: "enterprise" as const,
      color: "secondary",
    },
  ];

  // Stepper steps for create/edit form
  const formSteps = [
    "Basic Information",
    "Pricing & Validity",
    "Module Permissions",
  ];

  const handleStepNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleStepBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const updateModulePermission = (
    moduleId: string,
    permission: keyof (typeof formData.modules)[0]["permissions"],
    value: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.module_id === moduleId
          ? {
              ...module,
              permissions: { ...module.permissions, [permission]: value },
            }
          : module,
      ),
    }));
  };

  const addModuleToSubscription = (module: Module) => {
    if (!formData.modules.find((m) => m.module_id === module.id)) {
      setFormData((prev) => ({
        ...prev,
        modules: [
          ...prev.modules,
          {
            module_id: module.id,
            module_name: module.name,
            permissions: {
              view: true,
              edit: false,
              delete: false,
              create: false,
            },
          },
        ],
      }));
    }
  };

  const removeModuleFromSubscription = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.module_id !== moduleId),
    }));
  };

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
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.totalSubscriptions ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Plans
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
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {formatPrice(summary?.avgPrice ?? 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Price
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
                    <TimerIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.avgValidity ?? 0} days
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Validity
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
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.planDistribution
                        ? Object.values(summary.planDistribution).reduce(
                            (a, b) => a + b,
                            0,
                          )
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Plans
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
            Subscription Management
            {summary && (
              <Chip
                label={`${summary?.totalSubscriptions ?? 0} plans`}
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
                resetForm();
                setDialogs((prev) => ({ ...prev, create: true }));
              }}
            >
              Add Plan
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSubscriptions}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => setDialogs((prev) => ({ ...prev, export: true }))}
              disabled={subscriptions.length === 0}
            >
              Export
            </Button>

            {selectedSubscriptions.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BulkDeleteIcon />}
                onClick={() =>
                  setDialogs((prev) => ({ ...prev, bulkDelete: true }))
                }
              >
                Delete ({selectedSubscriptions.length})
              </Button>
            )}
          </Stack>
        </Toolbar>

        {/* Quick Plan Type Filters */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Filter by Plan:
            </Typography>
            {quickFilters.map((filter) => (
              <Chip
                key={filter.planType}
                label={filter.label}
                clickable
                color={
                  filters.planType === filter.planType ? "primary" : "default"
                }
                variant={
                  filters.planType === filter.planType ? "filled" : "outlined"
                }
                onClick={() => handleFilterChange("planType", filter.planType)}
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
                filters.priceMin !== "" ||
                filters.priceMax !== "" ||
                filters.validityMin !== "" ||
                filters.validityMax !== "" ||
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
                  placeholder="Search plans..."
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
                <TextField
                  fullWidth
                  label="Min Price"
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) =>
                    handleFilterChange("priceMin", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Max Price"
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) =>
                    handleFilterChange("priceMax", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  size="small"
                />
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
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="validity">Validity</MenuItem>
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

              <Grid item xs={12} sm={6} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear
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
                        subscriptions.length > 0 &&
                        selectedSubscriptions.length === subscriptions.length
                      }
                      indeterminate={
                        selectedSubscriptions.length > 0 &&
                        selectedSubscriptions.length < subscriptions.length
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
                      Plan Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "price"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("price")}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "validity"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("validity")}
                    >
                      Validity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Modules</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "created_at"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("created_at")}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow
                    key={subscription.id}
                    selected={selectedSubscriptions.includes(subscription.id)}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedSubscriptions.includes(
                          subscription.id,
                        )}
                        onChange={() =>
                          handleSelectSubscription(subscription.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            bgcolor: getPlanTypeColor(subscription.name),
                            width: 32,
                            height: 32,
                          }}
                        >
                          {getPlanTypeIcon(subscription.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {subscription.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {subscription.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        fontWeight="medium"
                        color="success.main"
                      >
                        {formatPrice(subscription.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<TimerIcon />}
                        label={formatValidity(subscription.validity)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ModuleIcon />}
                        label={`${subscription.modules.length} modules`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {subscription.created_at
                          ? format(
                              new Date(subscription.created_at),
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
                            onClick={() => openViewDialog(subscription)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Plan">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(subscription)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Plan">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setViewingSubscription(subscription);
                              setDialogs((prev) => ({ ...prev, delete: true }));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No subscription plans found
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
            <Grid container spacing={3}>
              {subscriptions.map((subscription) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={subscription.id}>
                  <Card
                    sx={{
                      height: "100%",
                      border: selectedSubscriptions.includes(subscription.id)
                        ? 2
                        : 0,
                      borderColor: "primary.main",
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={selectedSubscriptions.includes(
                              subscription.id,
                            )}
                            onChange={() =>
                              handleSelectSubscription(subscription.id)
                            }
                            size="small"
                          />
                          <Avatar
                            sx={{
                              bgcolor: getPlanTypeColor(subscription.name),
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getPlanTypeIcon(subscription.name)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                              {subscription.name}
                            </Typography>
                            <Typography
                              variant="h5"
                              color="success.main"
                              fontWeight="bold"
                            >
                              {formatPrice(subscription.price)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {subscription.description || "No description"}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<TimerIcon />}
                            label={formatValidity(subscription.validity)}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<ModuleIcon />}
                            label={`${subscription.modules.length} modules`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          Created:{" "}
                          {subscription.created_at
                            ? format(
                                new Date(subscription.created_at),
                                "MMM dd, yyyy",
                              )
                            : "—"}
                        </Typography>
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => openViewDialog(subscription)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(subscription)}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {subscriptions.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No subscription plans found
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

      {/* Create/Edit Dialog with Stepper */}
      <Dialog
        open={dialogs.create || dialogs.edit}
        onClose={() => {
          setDialogs((prev) => ({ ...prev, create: false, edit: false }));
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogs.create
            ? "Create New Subscription Plan"
            : "Edit Subscription Plan"}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {formSteps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 && (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <TextField
                        autoFocus
                        label="Plan Name"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                      />
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                      />
                    </Stack>
                  )}

                  {index === 1 && (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <TextField
                        label="Price"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        error={!!formErrors.price}
                        helperText={formErrors.price}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Validity (days)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.validity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            validity: Number(e.target.value),
                          }))
                        }
                        error={!!formErrors.validity}
                        helperText={formErrors.validity}
                      />
                    </Stack>
                  )}

                  {index === 2 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Available Modules
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {modules
                          .filter(
                            (module) =>
                              !formData.modules.find(
                                (m) => m.module_id === module.id,
                              ),
                          )
                          .map((module) => (
                            <Grid item key={module.id}>
                              <Chip
                                label={module.name}
                                onClick={() => addModuleToSubscription(module)}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                          ))}
                      </Grid>

                      <Typography variant="subtitle2" gutterBottom>
                        Selected Modules & Permissions
                      </Typography>
                      <Stack spacing={2}>
                        {formData.modules.map((modulePermission) => (
                          <Card
                            key={modulePermission.module_id}
                            variant="outlined"
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Typography variant="subtitle2">
                                  {modulePermission.module_name}
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    removeModuleFromSubscription(
                                      modulePermission.module_id,
                                    )
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Stack>
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        modulePermission.permissions.view
                                      }
                                      onChange={(e) =>
                                        updateModulePermission(
                                          modulePermission.module_id,
                                          "view",
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label="View"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        modulePermission.permissions.create
                                      }
                                      onChange={(e) =>
                                        updateModulePermission(
                                          modulePermission.module_id,
                                          "create",
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label="Create"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        modulePermission.permissions.edit
                                      }
                                      onChange={(e) =>
                                        updateModulePermission(
                                          modulePermission.module_id,
                                          "edit",
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label="Edit"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        modulePermission.permissions.delete
                                      }
                                      onChange={(e) =>
                                        updateModulePermission(
                                          modulePermission.module_id,
                                          "delete",
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label="Delete"
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ mb: 2, mt: 3 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={
                          index === formSteps.length - 1
                            ? dialogs.create
                              ? handleCreateSubscription
                              : handleUpdateSubscription
                            : handleStepNext
                        }
                        sx={{ mr: 1 }}
                      >
                        {index === formSteps.length - 1
                          ? dialogs.create
                            ? "Create Plan"
                            : "Update Plan"
                          : "Continue"}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleStepBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogs((prev) => ({ ...prev, create: false, edit: false }));
              resetForm();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={dialogs.view}
        onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
      >
        <DialogTitle>Subscription Plan Details</DialogTitle>
        <DialogContent>
          {viewingSubscription && (
            <Stack spacing={2}>
              <TextField
                label="Plan Name"
                value={viewingSubscription.name}
                fullWidth
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Description"
                value={viewingSubscription.description || "No description"}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Price"
                  value={formatPrice(viewingSubscription.price)}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Validity"
                  value={formatValidity(viewingSubscription.validity)}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <Typography variant="subtitle2">
                Modules & Permissions:
              </Typography>
              <Stack spacing={1}>
                {viewingSubscription.modules.map((modulePermission) => (
                  <Card key={modulePermission.module_id} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2">
                        {modulePermission.module_name}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        {Object.entries(modulePermission.permissions).map(
                          ([permission, value]) => (
                            <Chip
                              key={permission}
                              label={permission}
                              color={value ? "success" : "default"}
                              size="small"
                              variant={value ? "filled" : "outlined"}
                            />
                          ),
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Created"
                  value={
                    viewingSubscription.created_at
                      ? format(new Date(viewingSubscription.created_at), "PPP")
                      : "—"
                  }
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Updated"
                  value={
                    viewingSubscription.updated_at
                      ? format(new Date(viewingSubscription.updated_at), "PPP")
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
          {viewingSubscription && (
            <Button
              onClick={() => openEditDialog(viewingSubscription)}
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
        <DialogTitle>Delete Subscription Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{viewingSubscription?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, delete: false }))}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              viewingSubscription &&
              handleDeleteSubscription(viewingSubscription)
            }
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
        <DialogTitle>Delete Selected Plans</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedSubscriptions.length}{" "}
            selected subscription plans? This action cannot be undone.
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
            Delete {selectedSubscriptions.length} Plans
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={dialogs.export}
        onClose={() => setDialogs((prev) => ({ ...prev, export: false }))}
      >
        <DialogTitle>Export Subscription Plans</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for exporting subscription plans:
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
          resetForm();
          setDialogs((prev) => ({ ...prev, create: true }));
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default SubscriptionManagementEnhanced;
