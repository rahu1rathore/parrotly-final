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
  Settings as SettingsIcon,
  Extension as ExtensionIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { Role, RoleFormData, ModuleDefinition, ModuleAction, Organization, SubscriptionPlan, User } from "../types/rbac";

interface RoleManagementProps {
  organizationId?: string;
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
  organization: string;
  isActive: "all" | "active" | "inactive";
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  organizationId,
  isSuperAdmin = false,
  subscriptionPlan,
}) => {
  // Core state
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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
    organization: organizationId || "",
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
    permissions: false,
  });

  // Form state
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: {},
  });
  const [formErrors, setFormErrors] = useState<Partial<RoleFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRoleForMenu, setSelectedRoleForMenu] = useState<Role | null>(null);

  // Mock data
  const mockRoles: Role[] = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full access to all modules within subscription limits",
      organizationId: "org1",
      permissions: {
        crm: ["view", "edit", "manage"],
        reports: ["view", "edit"],
        users: ["view", "edit", "manage"],
        billing: ["view", "edit"],
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
    },
    {
      id: "manager",
      name: "Manager",
      description: "Manage daily operations and view reports",
      organizationId: "org1",
      permissions: {
        crm: ["view", "edit"],
        reports: ["view"],
        users: ["view"],
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to basic modules",
      organizationId: "org1",
      permissions: {
        crm: ["view"],
        reports: ["view"],
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
  ];

  const mockModules: ModuleDefinition[] = [
    {
      id: "crm",
      name: "CRM",
      displayName: "Customer Relationship Management",
      description: "Manage customer relationships, leads, and sales pipeline",
      category: "Core",
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
      availableActions: ["view", "edit", "manage"],
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
      availableActions: ["view", "edit", "manage"],
      isCore: false,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockUsers: User[] = [
    { id: "1", name: "John Admin", email: "john@example.com", organizationId: "org1", roleId: "admin", roleName: "Administrator", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", name: "Jane Manager", email: "jane@example.com", organizationId: "org1", roleId: "manager", roleName: "Manager", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "3", name: "Bob Viewer", email: "bob@example.com", organizationId: "org1", roleId: "viewer", roleName: "Viewer", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  useEffect(() => {
    loadRoles();
    loadModules();
    loadUsers();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockRoles];

      if (filters.search) {
        filteredData = filteredData.filter((role) =>
          role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          role.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.organization && !isSuperAdmin) {
        filteredData = filteredData.filter((role) => role.organizationId === filters.organization);
      }

      if (filters.isActive !== "all") {
        filteredData = filteredData.filter((role) => 
          filters.isActive === "active" ? role.isActive : !role.isActive
        );
      }

      setRoles(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading roles:", error);
      setError("Failed to load roles. Please try again.");
      showSnackbar("Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = () => {
    setModules(mockModules);
  };

  const loadUsers = () => {
    setUsers(mockUsers);
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
      organization: organizationId || "",
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
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((r) => r.id));
    }
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoleForMenu(role);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRoleForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedRoleForMenu) {
      setViewingRole(selectedRoleForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedRoleForMenu) {
      openEditDialog(selectedRoleForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedRoleForMenu) {
      setViewingRole(selectedRoleForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  const handlePermissionsAction = () => {
    if (selectedRoleForMenu) {
      setViewingRole(selectedRoleForMenu);
      setDialogs((prev) => ({ ...prev, permissions: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateRole = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Role name is required" });
        return;
      }

      const newRole: Role = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        organizationId: organizationId || "org1",
        permissions: formData.permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
      };

      showSnackbar("Role created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ name: "", description: "", permissions: {} });
      loadRoles();
    } catch (error) {
      showSnackbar("Failed to create role", "error");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Role name is required" });
        return;
      }

      showSnackbar("Role updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: {} });
      loadRoles();
    } catch (error) {
      showSnackbar("Failed to update role", "error");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      // Check if role is in use
      const usersWithRole = users.filter(u => u.roleId === role.id);
      if (usersWithRole.length > 0) {
        showSnackbar(`Cannot delete role. ${usersWithRole.length} users are assigned to this role.`, "error");
        return;
      }

      showSnackbar("Role deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadRoles();
    } catch (error) {
      showSnackbar("Failed to delete role", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Check if any roles are in use
      const rolesInUse = selectedRoles.filter(roleId => 
        users.some(u => u.roleId === roleId)
      );

      if (rolesInUse.length > 0) {
        showSnackbar(`Cannot delete ${rolesInUse.length} roles that have assigned users.`, "error");
        return;
      }

      showSnackbar(
        `${selectedRoles.length} roles deleted successfully`,
        "success",
      );
      setSelectedRoles([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadRoles();
    } catch (error) {
      showSnackbar("Failed to delete roles", "error");
    }
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const handlePermissionToggle = (moduleId: string, action: ModuleAction) => {
    setFormData(prev => {
      const currentActions = prev.permissions[moduleId] || [];
      const newActions = currentActions.includes(action)
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: newActions,
        },
      };
    });
  };

  const isActionAllowedBySubscription = (moduleId: string, action: ModuleAction): boolean => {
    return subscriptionPlan?.modules[moduleId]?.includes(action) || false;
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
      default: return <ExtensionIcon className="text-gray-600" />;
    }
  };

  const getRolePermissionSummary = (role: Role) => {
    const totalModules = Object.keys(role.permissions).length;
    const totalActions = Object.values(role.permissions).flat().length;
    return `${totalModules} modules, ${totalActions} actions`;
  };

  const getUsersWithRole = (roleId: string) => {
    return users.filter(u => u.roleId === roleId);
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Roles", isActive: "all" as const },
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
              Role Management
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Define and manage user roles and their permissions
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
                    placeholder="Search roles..."
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
                  variant="contained"
                  startIcon={<AddIcon style={{ fontSize: '16px' }} />}
                  onClick={() => {
                    setFormData({ name: "", description: "", permissions: {} });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Role
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadRoles}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={roles.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedRoles.length > 0 && (
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
                    Delete ({selectedRoles.length})
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        roles.length > 0 &&
                        selectedRoles.length === roles.length
                      }
                      indeterminate={
                        selectedRoles.length > 0 &&
                        selectedRoles.length < roles.length
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
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Permissions Summary</TableCell>
                  <TableCell className="font-semibold text-gray-700">Assigned Users</TableCell>
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
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => {
                  const assignedUsers = getUsersWithRole(role.id);
                  return (
                    <TableRow
                      key={role.id}
                      selected={selectedRoles.includes(role.id)}
                      hover
                      className="hover:bg-gray-50"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleSelectRole(role.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <GroupIcon className="text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.description || "No description"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Typography variant="body2" className="font-medium">
                            {getRolePermissionSummary(role)}
                          </Typography>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(role.permissions)
                              .slice(0, 3)
                              .map(([moduleId, actions]) => {
                                const module = modules.find(m => m.id === moduleId);
                                return (
                                  <Chip
                                    key={moduleId}
                                    label={`${module?.name || moduleId} (${actions.length})`}
                                    size="small"
                                    variant="outlined"
                                    className="text-xs"
                                  />
                                );
                              })}
                            {Object.keys(role.permissions).length > 3 && (
                              <Chip
                                label={`+${Object.keys(role.permissions).length - 3} more`}
                                size="small"
                                variant="outlined"
                                className="text-xs"
                              />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge badgeContent={assignedUsers.length} color="primary">
                            <PersonIcon className="text-gray-400" />
                          </Badge>
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {assignedUsers.length} users
                            </Typography>
                            {assignedUsers.length > 0 && (
                              <Typography variant="caption" className="text-gray-500">
                                {assignedUsers.slice(0, 2).map(u => u.name).join(", ")}
                                {assignedUsers.length > 2 && ` +${assignedUsers.length - 2} more`}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.isActive ? "Active" : "Inactive"}
                          color={role.isActive ? "success" : "default"}
                          size="small"
                          icon={role.isActive ? <CheckCircleIcon style={{ fontSize: 14 }} /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {role.createdAt
                            ? format(new Date(role.createdAt), "MMM dd, yyyy")
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, role)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {roles.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-12">
                      <div className="text-center">
                        <GroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No roles found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first role
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
            <ListItemText>Manage Permissions</ListItemText>
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

        {/* Role Form Dialogs */}
        {[
          { key: "create", title: "Create New Role", action: handleCreateRole },
          { key: "edit", title: "Edit Role", action: handleUpdateRole },
        ].map(({ key, title, action }) => (
          <Dialog
            key={key}
            open={dialogs[key as keyof typeof dialogs]}
            onClose={() => setDialogs((prev) => ({ ...prev, [key]: false }))}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Role Name"
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
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                
                <div>
                  <Typography variant="subtitle1" className="mb-3 font-semibold">
                    Module Permissions
                  </Typography>
                  <div className="space-y-3">
                    {modules.map((module) => {
                      const selectedActions = formData.permissions[module.id] || [];
                      return (
                        <Card key={module.id} variant="outlined">
                          <CardContent className="py-3">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                {getCategoryIcon(module.category)}
                              </div>
                              <div className="flex-1">
                                <Typography variant="subtitle2" className="font-semibold">
                                  {module.displayName}
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  {module.description}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {module.availableActions.map((action) => {
                                const isSelected = selectedActions.includes(action);
                                const isAllowed = isActionAllowedBySubscription(module.id, action);
                                return (
                                  <Tooltip
                                    key={action}
                                    title={!isAllowed ? "Not allowed by subscription plan" : ""}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => handlePermissionToggle(module.id, action)}
                                          size="small"
                                          disabled={!isAllowed}
                                        />
                                      }
                                      label={
                                        <div className="flex items-center gap-1">
                                          {getActionIcon(action)}
                                          <span className="capitalize text-sm">{action}</span>
                                          {!isAllowed && <LockIcon style={{ fontSize: 12 }} className="text-gray-400" />}
                                        </div>
                                      }
                                    />
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogs((prev) => ({ ...prev, [key]: false }))}
              >
                Cancel
              </Button>
              <Button onClick={action} variant="contained">
                {key === "create" ? "Create" : "Update"}
              </Button>
            </DialogActions>
          </Dialog>
        ))}

        {/* Other dialogs would go here... */}

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

export default RoleManagement;
