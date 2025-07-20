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
  Tooltip,
  Badge,
  Divider,
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
  Security as SecurityIcon,
  Extension as ExtensionIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { ModuleDefinition, ModuleAction, SubscriptionPlan, Role, User, EffectivePermissions, ModuleToggleState } from "../types/rbac";

interface ModuleManagementRBACProps {
  organizationId?: string;
  currentUserId?: string;
  isSuperAdmin?: boolean;
  subscriptionPlan?: SubscriptionPlan;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  category: string;
  status: "all" | "active" | "inactive";
  sortBy: "name" | "category" | "created_at";
  sortOrder: "asc" | "desc";
}

const ModuleManagementRBAC: React.FC<ModuleManagementRBACProps> = ({
  organizationId,
  currentUserId,
  isSuperAdmin = false,
  subscriptionPlan,
}) => {
  // Core state
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permission state
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleToggleState[]>>({});
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermissions[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    status: "all",
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
    permissions: false,
  });

  const [editingModule, setEditingModule] = useState<ModuleDefinition | null>(null);
  const [viewingModule, setViewingModule] = useState<ModuleDefinition | null>(null);

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleForMenu, setSelectedModuleForMenu] = useState<ModuleDefinition | null>(null);

  // Mock data - In real app, this would come from API
  const mockModules: ModuleDefinition[] = [
    {
      id: "crm",
      name: "CRM",
      displayName: "Customer Relationship Management",
      description: "Manage customer relationships, leads, and sales pipeline",
      category: "Core",
      icon: "crm",
      availableActions: ["view", "edit", "manage"],
      isCore: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "reports",
      name: "Reports",
      displayName: "Analytics & Reports",
      description: "Generate and view detailed business reports",
      category: "Analytics",
      icon: "analytics",
      availableActions: ["view", "edit"],
      isCore: false,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "users",
      name: "Users",
      displayName: "User Management",
      description: "Manage system users and permissions",
      category: "Administration",
      icon: "users",
      availableActions: ["view", "edit", "manage"],
      dependencies: ["crm"],
      isCore: true,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "billing",
      name: "Billing",
      displayName: "Billing & Payments",
      description: "Handle invoicing, payments, and financial transactions",
      category: "Finance",
      icon: "billing",
      availableActions: ["view", "edit", "manage", "disable"],
      isCore: false,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "integrations",
      name: "Integrations",
      displayName: "Third-party Integrations",
      description: "Configure and manage external service integrations",
      category: "System",
      icon: "integrations",
      availableActions: ["view", "edit", "disable"],
      isCore: false,
      order: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const categories = ["All", "Core", "Analytics", "Administration", "Finance", "System"];

  useEffect(() => {
    loadModules();
    if (organizationId && currentUserId) {
      loadUserPermissions();
    }
  }, [organizationId, currentUserId, pagination.page, pagination.rowsPerPage, filters]);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockModules];

      if (filters.search) {
        filteredData = filteredData.filter((module) =>
          module.displayName.toLowerCase().includes(filters.search.toLowerCase()) ||
          module.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.category && filters.category !== "All") {
        filteredData = filteredData.filter((module) => module.category === filters.category);
      }

      setModules(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading modules:", error);
      setError("Failed to load modules. Please try again.");
      showSnackbar("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    // Load user's effective permissions based on role and subscription
    try {
      const mockEffectivePermissions: EffectivePermissions[] = mockModules.map((module) => {
        const subscriptionActions = subscriptionPlan?.modules[module.id] || [];
        const roleActions = ["view", "edit"]; // Mock role permissions
        const allowedActions = subscriptionActions.filter(action => 
          roleActions.includes(action)
        ) as ModuleAction[];

        return {
          moduleId: module.id,
          moduleName: module.displayName,
          allowedActions,
          restrictedBy: allowedActions.length < roleActions.length ? "subscription" : "none",
        };
      });

      setEffectivePermissions(mockEffectivePermissions);
      generateModuleStates(mockEffectivePermissions);
    } catch (error) {
      console.error("Error loading user permissions:", error);
    }
  };

  const generateModuleStates = (permissions: EffectivePermissions[]) => {
    const states: Record<string, ModuleToggleState[]> = {};
    
    modules.forEach((module) => {
      const userPermissions = permissions.find(p => p.moduleId === module.id);
      const subscriptionActions = subscriptionPlan?.modules[module.id] || [];
      const roleActions = ["view", "edit", "manage"]; // Mock role permissions

      states[module.id] = module.availableActions.map((action) => ({
        moduleId: module.id,
        action,
        enabled: userPermissions?.allowedActions.includes(action) || false,
        allowedBySubscription: subscriptionActions.includes(action),
        allowedByRole: roleActions.includes(action),
      }));
    });

    setModuleStates(states);
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
      category: "",
      status: "all",
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
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, module: ModuleDefinition) => {
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

  const handlePermissionsAction = () => {
    if (selectedModuleForMenu) {
      setViewingModule(selectedModuleForMenu);
      setDialogs((prev) => ({ ...prev, permissions: true }));
    }
    handleActionClose();
  };

  const handleToggleAction = (moduleId: string, action: ModuleAction, enabled: boolean) => {
    if (!isSuperAdmin && !canUserToggleAction(moduleId, action)) {
      showSnackbar("You don't have permission to modify this action", "error");
      return;
    }

    // Update module state
    setModuleStates((prev) => ({
      ...prev,
      [moduleId]: prev[moduleId].map((state) =>
        state.action === action ? { ...state, enabled } : state
      ),
    }));

    showSnackbar(`${action} ${enabled ? "enabled" : "disabled"} for module`, "success");
  };

  const canUserToggleAction = (moduleId: string, action: ModuleAction): boolean => {
    const moduleState = moduleStates[moduleId]?.find(s => s.action === action);
    return moduleState?.allowedBySubscription && moduleState?.allowedByRole;
  };

  const getActionIcon = (action: ModuleAction) => {
    switch (action) {
      case "view": return <ViewIcon style={{ fontSize: 16 }} />;
      case "edit": return <EditIcon style={{ fontSize: 16 }} />;
      case "manage": return <SettingsIcon style={{ fontSize: 16 }} />;
      case "disable": return <LockIcon style={{ fontSize: 16 }} />;
      default: return <ExtensionIcon style={{ fontSize: 16 }} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Core": return <SecurityIcon className="text-red-600" />;
      case "Analytics": return <ExtensionIcon className="text-blue-600" />;
      case "Administration": return <GroupIcon className="text-purple-600" />;
      case "Finance": return <BusinessIcon className="text-green-600" />;
      case "System": return <SettingsIcon className="text-orange-600" />;
      default: return <ExtensionIcon className="text-gray-600" />;
    }
  };

  const getRestrictionBadge = (moduleId: string) => {
    const permission = effectivePermissions.find(p => p.moduleId === moduleId);
    const module = modules.find(m => m.id === moduleId);
    
    if (!permission || !module) return null;

    const hasAllActions = permission.allowedActions.length === module.availableActions.length;
    
    if (permission.restrictedBy === "subscription") {
      return (
        <Tooltip title="Limited by subscription plan">
          <Chip 
            size="small" 
            label="Subscription Limited" 
            color="warning" 
            icon={<LockIcon style={{ fontSize: 14 }} />}
          />
        </Tooltip>
      );
    }

    if (permission.restrictedBy === "role") {
      return (
        <Tooltip title="Limited by role permissions">
          <Chip 
            size="small" 
            label="Role Limited" 
            color="info" 
            icon={<GroupIcon style={{ fontSize: 14 }} />}
          />
        </Tooltip>
      );
    }

    if (hasAllActions) {
      return (
        <Tooltip title="Full access">
          <Chip 
            size="small" 
            label="Full Access" 
            color="success" 
            icon={<UnlockIcon style={{ fontSize: 14 }} />}
          />
        </Tooltip>
      );
    }

    return null;
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Modules", status: "all" as const },
    { label: "Core Modules", category: "Core" },
    { label: "Analytics", category: "Analytics" },
    { label: "Administration", category: "Administration" },
  ];

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="font-bold text-gray-900 mb-2">
              Module Management
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              {isSuperAdmin 
                ? "Manage system modules and permissions"
                : "View your available modules and permissions"
              }
            </Typography>
          </div>
          {subscriptionPlan && (
            <Card className="p-4">
              <Typography variant="subtitle2" className="text-gray-600">
                Current Plan
              </Typography>
              <Typography variant="h6" className="font-semibold text-blue-600">
                {subscriptionPlan.planName} {subscriptionPlan.version}
              </Typography>
            </Card>
          )}
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
                        onClick={() => {
                          if ('status' in filter) {
                            handleFilterChange("status", filter.status);
                          } else if ('category' in filter) {
                            handleFilterChange("category", filter.category);
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          (('status' in filter && filters.status === filter.status) ||
                           ('category' in filter && filters.category === filter.category))
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
                    placeholder="Search modules..."
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

                {/* Category Filter */}
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    label="Category"
                    className="bg-white"
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.slice(1).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
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
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadModules}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={modules.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {isSuperAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon style={{ fontSize: '16px' }} />}
                    onClick={() => setDialogs((prev) => ({ ...prev, create: true }))}
                    size="small"
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    Add Module
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

          {/* Table */}
          <TableContainer className="max-h-96 overflow-auto">
            <Table stickyHeader>
              <TableHead>
                <TableRow className="bg-gray-50">
                  {isSuperAdmin && (
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
                  )}
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("name")}
                      className="font-semibold text-gray-700"
                    >
                      Module
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Category</TableCell>
                  <TableCell className="font-semibold text-gray-700">Available Actions</TableCell>
                  <TableCell className="font-semibold text-gray-700">Access Level</TableCell>
                  <TableCell className="font-semibold text-gray-700">Dependencies</TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module) => {
                  const states = moduleStates[module.id] || [];
                  return (
                    <TableRow
                      key={module.id}
                      selected={selectedModules.includes(module.id)}
                      hover
                      className="hover:bg-gray-50"
                    >
                      {isSuperAdmin && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedModules.includes(module.id)}
                            onChange={() => handleSelectModule(module.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            {getCategoryIcon(module.category)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {module.displayName}
                              {module.isCore && (
                                <Chip size="small" label="Core" color="error" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{module.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={module.category}
                          size="small"
                          variant="outlined"
                          className="font-medium"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {module.availableActions.map((action) => {
                            const state = states.find(s => s.action === action);
                            const isEnabled = state?.enabled || false;
                            const canToggle = canUserToggleAction(module.id, action);
                            
                            return (
                              <Tooltip 
                                key={action}
                                title={
                                  !state?.allowedBySubscription 
                                    ? "Not allowed by subscription plan"
                                    : !state?.allowedByRole 
                                    ? "Not allowed by role"
                                    : isEnabled 
                                    ? `${action} is enabled`
                                    : `${action} is disabled`
                                }
                              >
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={isEnabled}
                                      onChange={(e) => handleToggleAction(module.id, action, e.target.checked)}
                                      size="small"
                                      disabled={!canToggle && !isSuperAdmin}
                                      color={isEnabled ? "success" : "default"}
                                    />
                                  }
                                  label={
                                    <div className="flex items-center gap-1">
                                      {getActionIcon(action)}
                                      <span className="text-xs capitalize">{action}</span>
                                    </div>
                                  }
                                  className="m-0"
                                />
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRestrictionBadge(module.id)}
                      </TableCell>
                      <TableCell>
                        {module.dependencies && module.dependencies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {module.dependencies.map((depId) => {
                              const depModule = modules.find(m => m.id === depId);
                              return (
                                <Chip
                                  key={depId}
                                  label={depModule?.name || depId}
                                  size="small"
                                  variant="outlined"
                                  className="text-xs"
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
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
                    <TableCell colSpan={isSuperAdmin ? 7 : 6} align="center" className="py-12">
                      <div className="text-center">
                        <ExtensionIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No modules found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          {isSuperAdmin 
                            ? "Get started by creating your first module"
                            : "Contact your administrator to enable modules"
                          }
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
          <MenuItem onClick={handlePermissionsAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <SecurityIcon fontSize="small" className="text-green-600" />
            </ListItemIcon>
            <ListItemText>Permissions</ListItemText>
          </MenuItem>
          {isSuperAdmin && (
            <>
              <Divider />
              <MenuItem onClick={() => {}} className="hover:bg-gray-50">
                <ListItemIcon>
                  <EditIcon fontSize="small" className="text-yellow-600" />
                </ListItemIcon>
                <ListItemText>Edit Module</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {}} className="hover:bg-gray-50">
                <ListItemIcon>
                  <DeleteIcon fontSize="small" className="text-red-600" />
                </ListItemIcon>
                <ListItemText>Delete Module</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* View Module Dialog */}
        <Dialog
          open={dialogs.view}
          onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Module Details</DialogTitle>
          <DialogContent>
            {viewingModule && (
              <Stack spacing={3}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    {getCategoryIcon(viewingModule.category)}
                  </div>
                  <div>
                    <Typography variant="h6" className="font-semibold">
                      {viewingModule.displayName}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {viewingModule.description}
                    </Typography>
                  </div>
                </div>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Category"
                      value={viewingModule.category}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Module ID"
                      value={viewingModule.id}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Core Module"
                      value={viewingModule.isCore ? "Yes" : "No"}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Order"
                      value={viewingModule.order}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>

                <div>
                  <Typography variant="subtitle2" className="mb-2">Available Actions</Typography>
                  <div className="flex gap-2">
                    {viewingModule.availableActions.map((action) => (
                      <Chip
                        key={action}
                        label={action}
                        icon={getActionIcon(action)}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </div>
                </div>

                {viewingModule.dependencies && viewingModule.dependencies.length > 0 && (
                  <div>
                    <Typography variant="subtitle2" className="mb-2">Dependencies</Typography>
                    <div className="flex gap-2">
                      {viewingModule.dependencies.map((depId) => {
                        const depModule = modules.find(m => m.id === depId);
                        return (
                          <Chip
                            key={depId}
                            label={depModule?.displayName || depId}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogs((prev) => ({ ...prev, view: false }))}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog
          open={dialogs.permissions}
          onClose={() => setDialogs((prev) => ({ ...prev, permissions: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Module Permissions</DialogTitle>
          <DialogContent>
            {viewingModule && (
              <Stack spacing={3}>
                <Typography variant="h6" className="flex items-center gap-2">
                  {getCategoryIcon(viewingModule.category)}
                  {viewingModule.displayName}
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" className="mb-3 font-semibold">
                      Current Permission Status
                    </Typography>
                    
                    <div className="space-y-3">
                      {viewingModule.availableActions.map((action) => {
                        const state = moduleStates[viewingModule.id]?.find(s => s.action === action);
                        return (
                          <div key={action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getActionIcon(action)}
                              <div>
                                <Typography variant="body1" className="font-medium capitalize">
                                  {action}
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  {action === "view" && "Read access to module data"}
                                  {action === "edit" && "Modify existing module data"}
                                  {action === "manage" && "Full administrative control"}
                                  {action === "disable" && "Ability to disable features"}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Chip
                                size="small"
                                label={state?.allowedBySubscription ? "Plan ✓" : "Plan ✗"}
                                color={state?.allowedBySubscription ? "success" : "error"}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={state?.allowedByRole ? "Role ✓" : "Role ✗"}
                                color={state?.allowedByRole ? "success" : "error"}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={state?.enabled ? "Enabled" : "Disabled"}
                                color={state?.enabled ? "success" : "default"}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {subscriptionPlan && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" className="mb-2 font-semibold">
                        Subscription Plan Limits
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 mb-2">
                        Your <strong>{subscriptionPlan.planName}</strong> plan includes:
                      </Typography>
                      <div className="flex gap-2 flex-wrap">
                        {(subscriptionPlan.modules[viewingModule.id] || []).map((action) => (
                          <Chip
                            key={action}
                            label={action}
                            size="small"
                            color="primary"
                            icon={getActionIcon(action)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogs((prev) => ({ ...prev, permissions: false }))}>
              Close
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

export default ModuleManagementRBAC;
