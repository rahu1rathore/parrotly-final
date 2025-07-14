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
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Link,
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
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Public as PublicIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  ExpandMore as ExpandMoreIcon,
  GridView as GridViewIcon,
  ViewList,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  Store as StoreIcon,
  School as SchoolIcon,
  LocalHospital as HealthIcon,
  AccountBalance as FinanceIcon,
  Computer as TechIcon,
} from "@mui/icons-material";
import { format, differenceInYears } from "date-fns";
import { Organization, OrganizationFormData, Subscription } from "../types";
import { organizationAPI, subscriptionAPI } from "../services/api";

interface OrganizationManagementEnhancedProps {
  onOrganizationsChange?: () => void;
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
  country: string;
  state: string;
  city: string;
  subscriptionId: string;
  establishedAfter: string;
  establishedBefore: string;
  sortBy:
    | "name"
    | "established_date"
    | "created_at"
    | "updated_at"
    | "city"
    | "country";
  sortOrder: "asc" | "desc";
  industry: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise" | "all";
}

interface OrganizationSummary {
  totalOrganizations: number;
  countries: { [key: string]: number };
  subscriptionDistribution: { [key: string]: number };
  establishmentYears: {
    lastYear: number;
    last3Years: number;
    last5Years: number;
    older: number;
  };
  organizationSizes: {
    startup: number;
    small: number;
    medium: number;
    large: number;
    enterprise: number;
  };
}

type ViewMode = "table" | "grid";

const OrganizationManagementEnhanced: React.FC<
  OrganizationManagementEnhancedProps
> = ({ onOrganizationsChange }) => {
  // Core state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    [],
  );
  const [summary, setSummary] = useState<OrganizationSummary | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
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
    country: "",
    state: "",
    city: "",
    subscriptionId: "",
    establishedAfter: "",
    establishedBefore: "",
    sortBy: "created_at",
    sortOrder: "desc",
    industry: "",
    size: "all",
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
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] =
    useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    email: "",
    website: "",
    established_date: "",
    logo: "",
    phone_number: "",
    subscription_id: "",
    subscription_name: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrganizationFormData>>(
    {},
  );

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrganizationForMenu, setSelectedOrganizationForMenu] =
    useState<Organization | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadOrganizations();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  useEffect(() => {
    loadCountries();
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (filters.country) {
      loadStates(filters.country);
    } else {
      setStates([]);
    }
  }, [filters.country]);

  useEffect(() => {
    if (filters.state) {
      loadCities(filters.state);
    } else {
      setCities([]);
    }
  }, [filters.state]);

  // API functions
  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: filters.search,
        country: filters.country,
        state: filters.state,
        city: filters.city,
        subscription_id: filters.subscriptionId,
        established_after: filters.establishedAfter,
        established_before: filters.establishedBefore,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        industry: filters.industry,
        size: filters.size,
      };

      const response = await organizationAPI.getAll(params);

      setOrganizations(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.total_pages,
        hasNext: response.pagination.has_next,
        hasPrev: response.pagination.has_prev,
      }));
      setSummary(response.summary);
    } catch (error) {
      console.error("Error loading organizations:", error);
      setError("Failed to load organizations. Please try again.");
      showSnackbar("Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await organizationAPI.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  };

  const loadStates = async (country: string) => {
    try {
      const response = await organizationAPI.getStates(country);
      setStates(response.data);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  };

  const loadCities = async (state: string) => {
    try {
      const response = await organizationAPI.getCities(state);
      setCities(response.data);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getAll();
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
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
      country: "",
      state: "",
      city: "",
      subscriptionId: "",
      establishedAfter: "",
      establishedBefore: "",
      sortBy: "created_at",
      sortOrder: "desc",
      industry: "",
      size: "all",
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
    if (selectedOrganizations.length === organizations.length) {
      setSelectedOrganizations([]);
    } else {
      setSelectedOrganizations(organizations.map((o) => o.id));
    }
  };

  const handleSelectOrganization = (organizationId: string) => {
    setSelectedOrganizations((prev) =>
      prev.includes(organizationId)
        ? prev.filter((id) => id !== organizationId)
        : [...prev, organizationId],
    );
  };

  const handleCreateOrganization = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.email.trim()) {
        setFormErrors({ email: "Email is required" });
        return;
      }

      await organizationAPI.create(formData);
      showSnackbar("Organization created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      resetForm();
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to create organization", "error");
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrganization) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.email.trim()) {
        setFormErrors({ email: "Email is required" });
        return;
      }

      await organizationAPI.update(editingOrganization.id, formData);
      showSnackbar("Organization updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingOrganization(null);
      resetForm();
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to update organization", "error");
    }
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    try {
      await organizationAPI.delete(organization.id);
      showSnackbar("Organization deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete organization", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await organizationAPI.bulkDelete(selectedOrganizations);
      showSnackbar(
        `${selectedOrganizations.length} organizations deleted successfully`,
        "success",
      );
      setSelectedOrganizations([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete organizations", "error");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "json") => {
    try {
      setExporting(true);
      const response = await organizationAPI.export(format, filters);
      showSnackbar(`Export started. Download will begin shortly.`, "info");

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = `organizations-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

      setDialogs((prev) => ({ ...prev, export: false }));
    } catch (error) {
      showSnackbar("Failed to export organizations", "error");
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      email: "",
      website: "",
      established_date: "",
      logo: "",
      phone_number: "",
      subscription_id: "",
      subscription_name: "",
    });
    setFormErrors({});
  };

  const openEditDialog = (organization: Organization) => {
    setEditingOrganization(organization);
    setFormData({
      name: organization.name,
      description: organization.description || "",
      address: organization.address || "",
      city: organization.city || "",
      state: organization.state || "",
      country: organization.country || "",
      postal_code: organization.postal_code || "",
      email: organization.email || "",
      website: organization.website || "",
      established_date: organization.established_date || "",
      logo: organization.logo || "",
      phone_number: organization.phone_number || "",
      subscription_id: organization.subscription_id || "",
      subscription_name: organization.subscription_name || "",
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const openViewDialog = (organization: Organization) => {
    setViewingOrganization(organization);
    setDialogs((prev) => ({ ...prev, view: true }));
  };

  const getIndustryIcon = (orgName: string, description: string) => {
    const text = (orgName + " " + description).toLowerCase();
    if (
      text.includes("tech") ||
      text.includes("software") ||
      text.includes("digital")
    )
      return <TechIcon />;
    if (
      text.includes("fintech") ||
      text.includes("financial") ||
      text.includes("bank")
    )
      return <FinanceIcon />;
    if (text.includes("health") || text.includes("medical"))
      return <HealthIcon />;
    if (text.includes("retail") || text.includes("commerce"))
      return <StoreIcon />;
    if (text.includes("education") || text.includes("university"))
      return <SchoolIcon />;
    return <BusinessIcon />;
  };

  const getIndustryColor = (orgName: string, description: string) => {
    const text = (orgName + " " + description).toLowerCase();
    if (
      text.includes("tech") ||
      text.includes("software") ||
      text.includes("digital")
    )
      return "#2196f3";
    if (
      text.includes("fintech") ||
      text.includes("financial") ||
      text.includes("bank")
    )
      return "#4caf50";
    if (text.includes("health") || text.includes("medical")) return "#f44336";
    if (text.includes("retail") || text.includes("commerce")) return "#ff9800";
    if (text.includes("education") || text.includes("university"))
      return "#9c27b0";
    return "#607d8b";
  };

  const getOrganizationAge = (establishedDate: string) => {
    if (!establishedDate) return "Unknown";
    const years = differenceInYears(new Date(), new Date(establishedDate));
    if (years === 0) return "Less than 1 year";
    return `${years} year${years > 1 ? "s" : ""} old`;
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Organizations", size: "all" as const, color: "default" },
    { label: "Startups", size: "startup" as const, color: "success" },
    { label: "Small Business", size: "small" as const, color: "primary" },
    { label: "Enterprise", size: "enterprise" as const, color: "secondary" },
  ];

  const industryOptions = [
    { label: "All Industries", value: "" },
    { label: "Technology", value: "technology" },
    { label: "Finance", value: "finance" },
    { label: "Healthcare", value: "healthcare" },
    { label: "Retail", value: "retail" },
    { label: "Education", value: "education" },
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
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.totalOrganizations ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Organizations
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
                    <PublicIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.countries
                        ? Object.keys(summary.countries).length
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Countries
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
                    <GroupsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.subscriptionDistribution
                        ? Object.values(
                            summary.subscriptionDistribution,
                          ).reduce((a, b) => a + b, 0)
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Subscriptions
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
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.establishmentYears?.lastYear ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New This Year
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
            Organization Management
            {summary && (
              <Chip
                label={`${summary?.totalOrganizations ?? 0} organizations`}
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
              Add Organization
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadOrganizations}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => setDialogs((prev) => ({ ...prev, export: true }))}
              disabled={organizations.length === 0}
            >
              Export
            </Button>

            {selectedOrganizations.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BulkDeleteIcon />}
                onClick={() =>
                  setDialogs((prev) => ({ ...prev, bulkDelete: true }))
                }
              >
                Delete ({selectedOrganizations.length})
              </Button>
            )}
          </Stack>
        </Toolbar>

        {/* Quick Size Filters */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Filter by Size:
            </Typography>
            {quickFilters.map((filter) => (
              <Chip
                key={filter.size}
                label={filter.label}
                clickable
                color={filters.size === filter.size ? "primary" : "default"}
                variant={filters.size === filter.size ? "filled" : "outlined"}
                onClick={() => handleFilterChange("size", filter.size)}
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
                filters.country ||
                filters.state ||
                filters.city ||
                filters.subscriptionId ||
                filters.industry ||
                filters.establishedAfter ||
                filters.establishedBefore) && (
                <Chip label="Active" size="small" color="primary" />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search organizations..."
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
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={filters.country}
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                    label="Country"
                  >
                    <MenuItem value="">All Countries</MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>State/Province</InputLabel>
                  <Select
                    value={filters.state}
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    label="State/Province"
                    disabled={!filters.country}
                  >
                    <MenuItem value="">All States</MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={filters.industry}
                    onChange={(e) =>
                      handleFilterChange("industry", e.target.value)
                    }
                    label="Industry"
                  >
                    {industryOptions.map((industry) => (
                      <MenuItem key={industry.value} value={industry.value}>
                        {industry.label}
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
                    <MenuItem value="established_date">
                      Established Date
                    </MenuItem>
                    <MenuItem value="created_at">Created Date</MenuItem>
                    <MenuItem value="city">City</MenuItem>
                    <MenuItem value="country">Country</MenuItem>
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
                        organizations.length > 0 &&
                        selectedOrganizations.length === organizations.length
                      }
                      indeterminate={
                        selectedOrganizations.length > 0 &&
                        selectedOrganizations.length < organizations.length
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
                      Organization
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Contact Info</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "country"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("country")}
                    >
                      Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "established_date"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("established_date")}
                    >
                      Established
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.map((organization) => (
                  <TableRow
                    key={organization.id}
                    selected={selectedOrganizations.includes(organization.id)}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOrganizations.includes(
                          organization.id,
                        )}
                        onChange={() =>
                          handleSelectOrganization(organization.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          src={organization.logo}
                          sx={{
                            bgcolor: getIndustryColor(
                              organization.name,
                              organization.description || "",
                            ),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getIndustryIcon(
                            organization.name,
                            organization.description || "",
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {organization.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {organization.description || "No description"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {organization.email || "No email"}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {organization.phone_number || "No phone"}
                          </Typography>
                        </Stack>
                        {organization.website && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <WebsiteIcon fontSize="small" color="action" />
                            <Link
                              href={organization.website}
                              target="_blank"
                              variant="body2"
                              sx={{ textDecoration: "none" }}
                            >
                              Website
                            </Link>
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">
                            {organization.city}, {organization.state}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {organization.country}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          organization.subscription_name || "No subscription"
                        }
                        size="small"
                        color={
                          organization.subscription_name ? "primary" : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {organization.established_date
                          ? format(
                              new Date(organization.established_date),
                              "MMM dd, yyyy",
                            )
                          : "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getOrganizationAge(
                          organization.established_date || "",
                        )}
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
                            onClick={() => openViewDialog(organization)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Organization">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(organization)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Organization">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setViewingOrganization(organization);
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
                {organizations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No organizations found
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
              {organizations.map((organization) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={organization.id}>
                  <Card
                    sx={{
                      height: "100%",
                      border: selectedOrganizations.includes(organization.id)
                        ? 2
                        : 0,
                      borderColor: "primary.main",
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={selectedOrganizations.includes(
                              organization.id,
                            )}
                            onChange={() =>
                              handleSelectOrganization(organization.id)
                            }
                            size="small"
                          />
                          <Avatar
                            src={organization.logo}
                            sx={{
                              bgcolor: getIndustryColor(
                                organization.name,
                                organization.description || "",
                              ),
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getIndustryIcon(
                              organization.name,
                              organization.description || "",
                            )}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                              {organization.name}
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {organization.description || "No description"}
                        </Typography>

                        <Stack spacing={1}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {organization.city}, {organization.country}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <EmailIcon fontSize="small" color="action" />
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: "break-all" }}
                            >
                              {organization.email || "No email"}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Chip
                            label={
                              organization.subscription_name ||
                              "No subscription"
                            }
                            size="small"
                            color={
                              organization.subscription_name
                                ? "primary"
                                : "default"
                            }
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getOrganizationAge(
                              organization.established_date || "",
                            )}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => openViewDialog(organization)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => openEditDialog(organization)}
                          >
                            Edit
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {organizations.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No organizations found
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Organization Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                fullWidth
                variant="outlined"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State/Province"
                fullWidth
                variant="outlined"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Country"
                fullWidth
                variant="outlined"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Website"
                fullWidth
                variant="outlined"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Established Date"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.established_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    established_date: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={formData.subscription_id}
                  onChange={(e) => {
                    const selectedSub = subscriptions.find(
                      (s) => s.id === e.target.value,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      subscription_id: e.target.value,
                      subscription_name: selectedSub?.name || "",
                    }));
                  }}
                  label="Subscription Plan"
                >
                  <MenuItem value="">No subscription</MenuItem>
                  {subscriptions.map((subscription) => (
                    <MenuItem key={subscription.id} value={subscription.id}>
                      {subscription.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateOrganization} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={dialogs.edit}
        onClose={() => setDialogs((prev) => ({ ...prev, edit: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Organization Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                fullWidth
                variant="outlined"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State/Province"
                fullWidth
                variant="outlined"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Country"
                fullWidth
                variant="outlined"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Website"
                fullWidth
                variant="outlined"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Established Date"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.established_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    established_date: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={formData.subscription_id}
                  onChange={(e) => {
                    const selectedSub = subscriptions.find(
                      (s) => s.id === e.target.value,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      subscription_id: e.target.value,
                      subscription_name: selectedSub?.name || "",
                    }));
                  }}
                  label="Subscription Plan"
                >
                  <MenuItem value="">No subscription</MenuItem>
                  {subscriptions.map((subscription) => (
                    <MenuItem key={subscription.id} value={subscription.id}>
                      {subscription.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateOrganization} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={dialogs.view}
        onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent>
          {viewingOrganization && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Organization Name"
                  value={viewingOrganization.name}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={viewingOrganization.email || "No email"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={viewingOrganization.description || "No description"}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  value={viewingOrganization.phone_number || "No phone"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website"
                  value={viewingOrganization.website || "No website"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  value={viewingOrganization.address || "No address"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={`${viewingOrganization.city || ""}, ${viewingOrganization.state || ""}, ${viewingOrganization.country || ""}`}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Established Date"
                  value={
                    viewingOrganization.established_date
                      ? format(
                          new Date(viewingOrganization.established_date),
                          "PPP",
                        )
                      : "Unknown"
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Subscription Plan"
                  value={
                    viewingOrganization.subscription_name || "No subscription"
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Created"
                  value={
                    viewingOrganization.created_at
                      ? format(new Date(viewingOrganization.created_at), "PPP")
                      : "Unknown"
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Updated"
                  value={
                    viewingOrganization.updated_at
                      ? format(new Date(viewingOrganization.updated_at), "PPP")
                      : "Unknown"
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, view: false }))}
          >
            Close
          </Button>
          {viewingOrganization && (
            <Button
              onClick={() => openEditDialog(viewingOrganization)}
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
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{viewingOrganization?.name}"? This
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
              viewingOrganization &&
              handleDeleteOrganization(viewingOrganization)
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
        <DialogTitle>Delete Selected Organizations</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedOrganizations.length}{" "}
            selected organizations? This action cannot be undone.
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
            Delete {selectedOrganizations.length} Organizations
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={dialogs.export}
        onClose={() => setDialogs((prev) => ({ ...prev, export: false }))}
      >
        <DialogTitle>Export Organizations</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for exporting organizations:
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

export default OrganizationManagementEnhanced;
