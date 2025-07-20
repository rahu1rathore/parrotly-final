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
  FormControlLabel,
  TableSortLabel,
  Tooltip,
  Badge,
  Divider,
  Avatar,
  LinearProgress,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
    List,
  ListItem,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  DeleteSweep as BulkDeleteIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Extension as ExtensionIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Send as SendIcon,
  Block as BlockIcon,
  Domain as DomainIcon,
  Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { 
  Organization, 
  SubscriptionPlan, 
  User, 
  Role, 
  ModuleDefinition, 
  ModuleAction,
  OrganizationSubscription 
} from "../types/rbac";
import { format } from "date-fns";

interface OrganizationSettingsProps {
  organizationId?: string;
  isSuperAdmin?: boolean;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  subscriptionPlan: string;
  isActive: "all" | "active" | "inactive";
  sortBy: "name" | "domain" | "created_at" | "subscription";
  sortOrder: "asc" | "desc";
}

interface OrganizationFormData {
  name: string;
  domain: string;
  subscriptionPlanId: string;
}

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({
  organizationId,
  isSuperAdmin = false,
}) => {
  // Core state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [organizationSubscriptions, setOrganizationSubscriptions] = useState<OrganizationSubscription[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subscriptionPlan: "",
    isActive: "all",
    sortBy: "name",
    sortOrder: "asc",
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
    changePlan: false,
    planDetails: false,
  });

  // Form state
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    domain: "",
    subscriptionPlanId: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrganizationFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrgForMenu, setSelectedOrgForMenu] = useState<Organization | null>(null);

  // Mock data
  const mockOrganizations: Organization[] = [
    {
      id: "org1",
      name: "Acme Corporation",
      domain: "acme.com",
      subscriptionPlanId: "pro",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "org2",
      name: "TechStartup Inc",
      domain: "techstartup.com",
      subscriptionPlanId: "basic",
      isActive: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "org3",
      name: "Enterprise Solutions",
      domain: "enterprise.com",
      subscriptionPlanId: "enterprise",
      isActive: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "org4",
      name: "Inactive Company",
      domain: "inactive.com",
      subscriptionPlanId: "basic",
      isActive: false,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      planName: "Basic",
      version: "v1",
      description: "Essential features for small teams",
      price: 29,
      billingCycle: "monthly",
      maxUsers: 10,
      modules: {
        crm: ["view", "edit"],
        reports: ["view"],
        users: ["view"],
      },
      features: ["Basic CRM", "Standard Reports", "User Management", "Email Support"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
    {
      id: "pro",
      planName: "Professional",
      version: "v1",
      description: "Advanced features for growing businesses",
      price: 99,
      billingCycle: "monthly",
      maxUsers: 50,
      modules: {
        crm: ["view", "edit", "manage"],
        reports: ["view", "edit"],
        users: ["view", "edit"],
        billing: ["view"],
      },
      features: ["Advanced CRM", "Custom Reports", "Team Management", "Priority Support", "API Access"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
    {
      id: "enterprise",
      planName: "Enterprise",
      version: "v1",
      description: "Full-featured solution for large organizations",
      price: 299,
      billingCycle: "monthly",
      maxUsers: undefined, // Unlimited
      modules: {
        crm: ["view", "edit", "manage"],
        reports: ["view", "edit", "manage"],
        users: ["view", "edit", "manage"],
        billing: ["view", "edit", "manage"],
      },
      features: [
        "Full CRM Suite",
        "Advanced Analytics",
        "User & Role Management",
        "Billing Management",
        "24/7 Support",
        "Custom Integrations",
        "SSO",
        "Audit Logs"
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
  ];

  const mockUsers: User[] = [
    { id: "1", name: "John Admin", email: "john@acme.com", organizationId: "org1", roleId: "admin", roleName: "Administrator", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", name: "Jane Manager", email: "jane@acme.com", organizationId: "org1", roleId: "manager", roleName: "Manager", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "3", name: "Bob Tech", email: "bob@techstartup.com", organizationId: "org2", roleId: "admin", roleName: "Administrator", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "4", name: "Alice Enterprise", email: "alice@enterprise.com", organizationId: "org3", roleId: "admin", roleName: "Administrator", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const mockOrganizationSubscriptions: OrganizationSubscription[] = [
    {
      id: "sub1",
      organizationId: "org1",
      subscriptionPlanId: "pro",
      planName: "Professional",
      planVersion: "v1",
      startDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      endDate: new Date(Date.now() + 2592000000).toISOString(), // 30 days from now
      status: "active",
      autoRenewal: true,
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sub2",
      organizationId: "org2",
      subscriptionPlanId: "basic",
      planName: "Basic",
      planVersion: "v1",
      startDate: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
      endDate: new Date(Date.now() + 1296000000).toISOString(), // 15 days from now
      status: "active",
      autoRenewal: false,
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sub3",
      organizationId: "org3",
      subscriptionPlanId: "enterprise",
      planName: "Enterprise",
      planVersion: "v1",
      startDate: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
      endDate: new Date(Date.now() + 25920000000).toISOString(), // 300 days from now
      status: "active",
      autoRenewal: true,
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadOrganizations();
    loadSubscriptionPlans();
    loadUsers();
    loadOrganizationSubscriptions();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockOrganizations];

      if (filters.search) {
        filteredData = filteredData.filter((org) =>
          org.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          org.domain?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.subscriptionPlan) {
        filteredData = filteredData.filter((org) => org.subscriptionPlanId === filters.subscriptionPlan);
      }

      if (filters.isActive !== "all") {
        filteredData = filteredData.filter((org) => 
          filters.isActive === "active" ? org.isActive : !org.isActive
        );
      }

      setOrganizations(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading organizations:", error);
      setError("Failed to load organizations. Please try again.");
      showSnackbar("Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlans = () => {
    setSubscriptionPlans(mockSubscriptionPlans);
  };

  const loadUsers = () => {
    setUsers(mockUsers);
  };

  const loadOrganizationSubscriptions = () => {
    setOrganizationSubscriptions(mockOrganizationSubscriptions);
  };

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
      subscriptionPlan: "",
      isActive: "all",
      sortBy: "name",
      sortOrder: "asc",
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

  const handleSelectOrganization = (orgId: string) => {
    setSelectedOrganizations((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, organization: Organization) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrgForMenu(organization);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedOrgForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedOrgForMenu) {
      setViewingOrganization(selectedOrgForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedOrgForMenu) {
      openEditDialog(selectedOrgForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedOrgForMenu) {
      setViewingOrganization(selectedOrgForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  const handleChangePlanAction = () => {
    if (selectedOrgForMenu) {
      setViewingOrganization(selectedOrgForMenu);
      setDialogs((prev) => ({ ...prev, changePlan: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateOrganization = async () => {
    try {
      setFormErrors({});
      
      // Validation
      const errors: Partial<OrganizationFormData> = {};
      if (!formData.name.trim()) errors.name = "Organization name is required";
      if (!formData.domain.trim()) errors.domain = "Domain is required";
      if (!formData.subscriptionPlanId) errors.subscriptionPlanId = "Subscription plan is required";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Check if domain already exists
      if (organizations.some(o => o.domain?.toLowerCase() === formData.domain.toLowerCase())) {
        setFormErrors({ domain: "Organization with this domain already exists" });
        return;
      }

      const newOrganization: Organization = {
        id: Date.now().toString(),
        name: formData.name,
        domain: formData.domain,
        subscriptionPlanId: formData.subscriptionPlanId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      showSnackbar("Organization created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ name: "", domain: "", subscriptionPlanId: "" });
      loadOrganizations();
    } catch (error) {
      showSnackbar("Failed to create organization", "error");
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrganization) return;

    try {
      setFormErrors({});
      
      // Validation
      const errors: Partial<OrganizationFormData> = {};
      if (!formData.name.trim()) errors.name = "Organization name is required";
      if (!formData.domain.trim()) errors.domain = "Domain is required";
      if (!formData.subscriptionPlanId) errors.subscriptionPlanId = "Subscription plan is required";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Check if domain already exists (excluding current organization)
      if (organizations.some(o => o.id !== editingOrganization.id && o.domain?.toLowerCase() === formData.domain.toLowerCase())) {
        setFormErrors({ domain: "Organization with this domain already exists" });
        return;
      }

      showSnackbar("Organization updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingOrganization(null);
      setFormData({ name: "", domain: "", subscriptionPlanId: "" });
      loadOrganizations();
    } catch (error) {
      showSnackbar("Failed to update organization", "error");
    }
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    try {
      // Check if organization has users
      const orgUsers = users.filter(u => u.organizationId === organization.id);
      if (orgUsers.length > 0) {
        showSnackbar(`Cannot delete organization. ${orgUsers.length} users are assigned to this organization.`, "error");
        return;
      }

      showSnackbar("Organization deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadOrganizations();
    } catch (error) {
      showSnackbar("Failed to delete organization", "error");
    }
  };

  const handleChangePlan = async (organizationId: string, newPlanId: string) => {
    try {
      showSnackbar("Subscription plan updated successfully", "success");
      setDialogs((prev) => ({ ...prev, changePlan: false }));
      loadOrganizations();
      loadOrganizationSubscriptions();
    } catch (error) {
      showSnackbar("Failed to update subscription plan", "error");
    }
  };

  const handleToggleOrganizationStatus = async (organization: Organization) => {
    try {
      showSnackbar(
        `Organization ${organization.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      loadOrganizations();
    } catch (error) {
      showSnackbar("Failed to update organization status", "error");
    }
  };

  const openEditDialog = (organization: Organization) => {
    setEditingOrganization(organization);
    setFormData({
      name: organization.name,
      domain: organization.domain || "",
      subscriptionPlanId: organization.subscriptionPlanId,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getSubscriptionPlan = (planId: string) => {
    return subscriptionPlans.find(p => p.id === planId);
  };

  const getOrganizationSubscription = (orgId: string) => {
    return organizationSubscriptions.find(s => s.organizationId === orgId);
  };

  const getOrganizationUsers = (orgId: string) => {
    return users.filter(u => u.organizationId === orgId);
  };

  const getPlanStatusColor = (subscription?: OrganizationSubscription) => {
    if (!subscription) return "default";
    switch (subscription.status) {
      case "active": return "success";
      case "expired": return "error";
      case "cancelled": return "warning";
      case "suspended": return "error";
      default: return "default";
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Organizations", isActive: "all" as const },
    { label: "Active", isActive: "active" as const },
    { label: "Inactive", isActive: "inactive" as const },
  ];

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="font-bold text-gray-900 mb-2">
              Organization Settings
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Manage organizations and their subscription plans
            </Typography>
          </div>
        </div>

        {/* Unified Filter and Action Row */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 overflow-x-auto">
              {/* Left Section - Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Quick:</span>
                  <div className="flex items-center gap-1">
                    {quickFilters.map((filter) => (
                      <button
                        key={filter.label}
                        onClick={() => handleFilterChange("isActive", filter.isActive)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          filters.isActive === filter.isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="flex-shrink-0 w-full sm:w-auto min-w-[200px]">
                  <TextField
                    placeholder="Search organizations..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon className="text-gray-400" style={{ fontSize: '16px' }} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    className="bg-white"
                  />
                </div>

                {/* Plan Filter */}
                <FormControl size="small" className="min-w-[140px]">
                  <InputLabel>Subscription Plan</InputLabel>
                  <Select
                    value={filters.subscriptionPlan}
                    onChange={(e) => handleFilterChange("subscriptionPlan", e.target.value)}
                    label="Subscription Plan"
                    className="bg-white"
                  >
                    <MenuItem value="">All Plans</MenuItem>
                    {subscriptionPlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.planName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort Order */}
                <FormControl size="small" className="min-w-[80px]">
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    label="Order"
                    className="bg-white"
                  >
                    <MenuItem value="asc">↑</MenuItem>
                    <MenuItem value="desc">↓</MenuItem>
                  </Select>
                </FormControl>

                {/* Clear Filters */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  Clear
                </Button>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isSuperAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon style={{ fontSize: '16px' }} />}
                    onClick={() => {
                      setFormData({ name: "", domain: "", subscriptionPlanId: "" });
                      setFormErrors({});
                      setDialogs((prev) => ({ ...prev, create: true }));
                    }}
                    size="small"
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    Add Organization
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadOrganizations}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={organizations.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {isSuperAdmin && selectedOrganizations.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BulkDeleteIcon style={{ fontSize: '16px' }} />}
                    onClick={() =>
                      setDialogs((prev) => ({ ...prev, bulkDelete: true }))
                    }
                    size="small"
                    className="whitespace-nowrap"
                  >
                    Delete ({selectedOrganizations.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table Section */}
        <Paper className="shadow-lg rounded-lg overflow-hidden">
          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="m-4">
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && <LinearProgress />}

          {/* Table */}
          <TableContainer className="max-h-96 overflow-auto">
            <Table stickyHeader>
              <TableHead>
                <TableRow className="bg-gray-50">
                  {isSuperAdmin && (
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
                  )}
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("name")}
                      className="font-semibold text-gray-700"
                    >
                      Organization
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "subscription"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("subscription")}
                      className="font-semibold text-gray-700"
                    >
                      Subscription Plan
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Users</TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-700">Billing</TableCell>
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
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.map((organization) => {
                  const plan = getSubscriptionPlan(organization.subscriptionPlanId);
                  const subscription = getOrganizationSubscription(organization.id);
                  const orgUsers = getOrganizationUsers(organization.id);
                  const daysUntilExpiry = subscription ? getDaysUntilExpiry(subscription.endDate) : 0;
                  
                  return (
                    <TableRow
                      key={organization.id}
                      selected={selectedOrganizations.includes(organization.id)}
                      hover
                      className="hover:bg-gray-50"
                    >
                      {isSuperAdmin && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedOrganizations.includes(organization.id)}
                            onChange={() => handleSelectOrganization(organization.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BusinessIcon className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{organization.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <DomainIcon style={{ fontSize: 14 }} />
                              {organization.domain || "No domain"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Typography variant="body2" className="font-medium">
                                {plan?.planName || "Unknown Plan"}
                              </Typography>
                              {plan?.planName === "Enterprise" && (
                                <StarIcon className="text-yellow-500" style={{ fontSize: 16 }} />
                              )}
                            </div>
                            <Typography variant="caption" className="text-gray-500">
                              {plan?.description}
                            </Typography>
                          </div>
                          <Chip
                            label={`$${plan?.price || 0}/${plan?.billingCycle || "month"}`}
                            size="small"
                            variant="outlined"
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge badgeContent={orgUsers.length} color="primary">
                            <PersonIcon className="text-gray-400" />
                          </Badge>
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {orgUsers.length} users
                            </Typography>
                            {plan?.maxUsers && (
                              <Typography variant="caption" className="text-gray-500">
                                Limit: {plan.maxUsers}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Chip
                            label={organization.isActive ? "Active" : "Inactive"}
                            color={organization.isActive ? "success" : "default"}
                            size="small"
                          />
                          {subscription && (
                            <div>
                              <Chip
                                label={subscription.status}
                                color={getPlanStatusColor(subscription)}
                                size="small"
                                variant="outlined"
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscription && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <PaymentIcon className="text-gray-400" style={{ fontSize: 14 }} />
                              <Typography variant="caption" className={
                                subscription.paymentStatus === "paid" ? "text-green-600" :
                                subscription.paymentStatus === "pending" ? "text-yellow-600" : "text-red-600"
                              }>
                                {subscription.paymentStatus}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-1">
                              <ScheduleIcon className="text-gray-400" style={{ fontSize: 14 }} />
                              <Typography variant="caption" className={
                                daysUntilExpiry < 7 ? "text-red-600" :
                                daysUntilExpiry < 30 ? "text-yellow-600" : "text-green-600"
                              }>
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry}d left` : "Expired"}
                              </Typography>
                            </div>
                            {subscription.autoRenewal && (
                              <Typography variant="caption" className="text-blue-600">
                                Auto-renewal
                              </Typography>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {organization.createdAt
                            ? format(new Date(organization.createdAt), "MMM dd, yyyy")
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center gap-1">
                          {isSuperAdmin && (
                            <Tooltip title={organization.isActive ? "Deactivate organization" : "Activate organization"}>
                              <Switch
                                checked={organization.isActive}
                                onChange={() => handleToggleOrganizationStatus(organization)}
                                size="small"
                              />
                            </Tooltip>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionClick(e, organization)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {organizations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 8 : 7} align="center" className="py-12">
                      <div className="text-center">
                        <BusinessIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No organizations found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first organization
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
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleChangePlanAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <UpgradeIcon fontSize="small" className="text-green-600" />
            </ListItemIcon>
            <ListItemText>Change Plan</ListItemText>
          </MenuItem>
          {isSuperAdmin && (
            <>
              <MenuItem onClick={handleEditAction} className="hover:bg-gray-50">
                <ListItemIcon>
                  <EditIcon fontSize="small" className="text-yellow-600" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteAction} className="hover:bg-gray-50">
                <ListItemIcon>
                  <DeleteIcon fontSize="small" className="text-red-600" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Organization Form Dialogs */}
        {isSuperAdmin && [
          { key: "create", title: "Create New Organization", action: handleCreateOrganization },
          { key: "edit", title: "Edit Organization", action: handleUpdateOrganization },
        ].map(({ key, title, action }) => (
          <Dialog
            key={key}
            open={dialogs[key as keyof typeof dialogs]}
            onClose={() => setDialogs((prev) => ({ ...prev, [key]: false }))}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
                <TextField
                  fullWidth
                  label="Domain"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, domain: e.target.value }))
                  }
                  error={!!formErrors.domain}
                  helperText={formErrors.domain}
                  placeholder="example.com"
                  required
                />
                <FormControl fullWidth error={!!formErrors.subscriptionPlanId}>
                  <InputLabel>Subscription Plan *</InputLabel>
                  <Select
                    value={formData.subscriptionPlanId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subscriptionPlanId: e.target.value }))
                    }
                    label="Subscription Plan *"
                  >
                    {subscriptionPlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <Typography variant="body2">{plan.planName}</Typography>
                            <Typography variant="caption" className="text-gray-600">
                              {plan.description}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="font-medium">
                            ${plan.price}/{plan.billingCycle}
                          </Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.subscriptionPlanId && (
                    <Typography variant="caption" className="text-red-600 mt-1 ml-3">
                      {formErrors.subscriptionPlanId}
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogs((prev) => ({ ...prev, [key]: false }))}
              >
                Cancel
              </Button>
              <Button onClick={action} variant="contained">
                {key === "create" ? "Create Organization" : "Update Organization"}
              </Button>
            </DialogActions>
          </Dialog>
        ))}

        {/* View Organization Dialog */}
        <Dialog
          open={dialogs.view}
          onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BusinessIcon className="text-blue-600" />
              </div>
              <div>
                <Typography variant="h6">{viewingOrganization?.name}</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Organization Details
                </Typography>
              </div>
            </div>
          </DialogTitle>
          <DialogContent>
            {viewingOrganization && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Domain
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingOrganization.domain || "No domain set"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Status
                    </Typography>
                    <Chip
                      label={viewingOrganization.isActive ? "Active" : "Inactive"}
                      color={viewingOrganization.isActive ? "success" : "default"}
                      size="small"
                    />
                  </div>
                </div>

                {/* Subscription Details */}
                <div>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Subscription Plan
                  </Typography>
                  {(() => {
                    const plan = getSubscriptionPlan(viewingOrganization.subscriptionPlanId);
                    const subscription = getOrganizationSubscription(viewingOrganization.id);
                    return plan ? (
                      <Card variant="outlined">
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Typography variant="subtitle1" className="font-semibold">
                                {plan.planName}
                              </Typography>
                              {plan.planName === "Enterprise" && (
                                <StarIcon className="text-yellow-500" style={{ fontSize: 16 }} />
                              )}
                            </div>
                            <Typography variant="h6" className="font-bold text-blue-600">
                              ${plan.price}/{plan.billingCycle}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="text-gray-600 mb-3">
                            {plan.description}
                          </Typography>
                          
                          {subscription && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <Typography variant="caption" className="text-gray-500">
                                  Status
                                </Typography>
                                <div>
                                  <Chip
                                    label={subscription.status}
                                    color={getPlanStatusColor(subscription)}
                                    size="small"
                                  />
                                </div>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-gray-500">
                                  Expires
                                </Typography>
                                <Typography variant="body2">
                                  {format(new Date(subscription.endDate), "PPP")}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-gray-500">
                                  Payment Status
                                </Typography>
                                <Typography variant="body2" className={
                                  subscription.paymentStatus === "paid" ? "text-green-600" :
                                  subscription.paymentStatus === "pending" ? "text-yellow-600" : "text-red-600"
                                }>
                                  {subscription.paymentStatus}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="caption" className="text-gray-500">
                                  Auto Renewal
                                </Typography>
                                <Typography variant="body2">
                                  {subscription.autoRenewal ? "Enabled" : "Disabled"}
                                </Typography>
                              </div>
                            </div>
                          )}

                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle2">Plan Features</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {plan.features.map((feature, index) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <CheckCircleIcon className="text-green-600" style={{ fontSize: 18 }} />
                                    </ListItemIcon>
                                    <ListItemText primary={feature} />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </CardContent>
                      </Card>
                    ) : (
                      <Typography variant="body2" className="text-gray-500">
                        No subscription plan assigned
                      </Typography>
                    );
                  })()}
                </div>

                {/* Users */}
                <div>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Users ({getOrganizationUsers(viewingOrganization.id).length})
                  </Typography>
                  <div className="space-y-2">
                    {getOrganizationUsers(viewingOrganization.id).length > 0 ? (
                      getOrganizationUsers(viewingOrganization.id).map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <Avatar className="w-8 h-8 bg-blue-100 text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="flex-1">
                            <Typography variant="body2" className="font-medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-600">
                              {user.email} • {user.roleName}
                            </Typography>
                          </div>
                          <Chip
                            label={user.isActive ? "Active" : "Inactive"}
                            color={user.isActive ? "success" : "default"}
                            size="small"
                          />
                        </div>
                      ))
                    ) : (
                      <Typography variant="body2" className="text-gray-500 italic">
                        No users assigned to this organization
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Created
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingOrganization.createdAt ? format(new Date(viewingOrganization.createdAt), "PPP") : "Unknown"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingOrganization.updatedAt ? format(new Date(viewingOrganization.updatedAt), "PPP") : "Unknown"}
                    </Typography>
                  </div>
                </div>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogs((prev) => ({ ...prev, view: false }))}>
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<UpgradeIcon />}
              onClick={() => {
                setDialogs((prev) => ({ ...prev, view: false, changePlan: true }));
              }}
            >
              Change Plan
            </Button>
            {isSuperAdmin && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  if (viewingOrganization) {
                    setDialogs((prev) => ({ ...prev, view: false }));
                    openEditDialog(viewingOrganization);
                  }
                }}
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog
          open={dialogs.changePlan}
          onClose={() => setDialogs((prev) => ({ ...prev, changePlan: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UpgradeIcon className="text-green-600" />
              </div>
              <div>
                <Typography variant="h6">Change Subscription Plan</Typography>
                <Typography variant="body2" className="text-gray-600">
                  {viewingOrganization?.name}
                </Typography>
              </div>
            </div>
          </DialogTitle>
          <DialogContent>
            {viewingOrganization && (
              <div className="space-y-4 mt-2">
                <Alert severity="info">
                  <Typography variant="body2">
                    Changing the subscription plan will affect the organization's access to modules and features.
                    Users' effective permissions will be recalculated based on the new plan.
                  </Typography>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan) => {
                    const isCurrentPlan = plan.id === viewingOrganization.subscriptionPlanId;
                    const currentPlan = getSubscriptionPlan(viewingOrganization.subscriptionPlanId);
                    const isUpgrade = plan.price > (currentPlan?.price || 0);
                    const isDowngrade = plan.price < (currentPlan?.price || 0);
                    
                    return (
                      <Card 
                        key={plan.id} 
                        variant="outlined"
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isCurrentPlan ? "border-blue-500 bg-blue-50" : 
                          selectedPlan?.id === plan.id ? "border-green-500 bg-green-50" : ""
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6" className="font-bold">
                              {plan.planName}
                            </Typography>
                            {plan.planName === "Enterprise" && (
                              <StarIcon className="text-yellow-500" />
                            )}
                            {isCurrentPlan && (
                              <Chip label="Current" color="primary" size="small" />
                            )}
                          </div>
                          
                          <Typography variant="h4" className="font-bold text-blue-600 mb-1">
                            ${plan.price}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            per {plan.billingCycle}
                          </Typography>
                          
                          <Typography variant="body2" className="text-gray-600 my-3">
                            {plan.description}
                          </Typography>
                          
                          {plan.maxUsers && (
                            <Typography variant="caption" className="text-gray-500">
                              Up to {plan.maxUsers} users
                            </Typography>
                          )}
                          
                          {!isCurrentPlan && (
                            <div className="mt-3">
                              {isUpgrade && (
                                <Chip 
                                  label="Upgrade" 
                                  color="success" 
                                  size="small" 
                                  icon={<UpgradeIcon style={{ fontSize: 14 }} />} 
                                />
                              )}
                              {isDowngrade && (
                                <Chip 
                                  label="Downgrade" 
                                  color="warning" 
                                  size="small" 
                                />
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedPlan && selectedPlan.id !== viewingOrganization.subscriptionPlanId && (
                  <Card variant="outlined" className="bg-yellow-50 border-yellow-200">
                    <CardContent className="py-3">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Plan Comparison
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography variant="caption" className="text-gray-500">Current Plan</Typography>
                          <Typography variant="body2">
                            {getSubscriptionPlan(viewingOrganization.subscriptionPlanId)?.planName} - 
                            ${getSubscriptionPlan(viewingOrganization.subscriptionPlanId)?.price}/
                            {getSubscriptionPlan(viewingOrganization.subscriptionPlanId)?.billingCycle}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-gray-500">New Plan</Typography>
                          <Typography variant="body2">
                            {selectedPlan.planName} - ${selectedPlan.price}/{selectedPlan.billingCycle}
                          </Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogs((prev) => ({ ...prev, changePlan: false }));
              setSelectedPlan(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (viewingOrganization && selectedPlan) {
                  handleChangePlan(viewingOrganization.id, selectedPlan.id);
                  setSelectedPlan(null);
                }
              }}
              disabled={!selectedPlan || selectedPlan.id === viewingOrganization?.subscriptionPlanId}
            >
              Change Plan
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

export default OrganizationSettings;
