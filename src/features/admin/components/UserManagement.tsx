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
  Autocomplete,
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
} from "@mui/icons-material";
import { User, UserFormData, Role, Organization, SubscriptionPlan, ModuleDefinition, ModuleAction } from "../types/rbac";
import { format } from "date-fns";

interface UserManagementProps {
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
  role: string;
  isActive: "all" | "active" | "inactive";
  sortBy: "name" | "email" | "role" | "created_at";
  sortOrder: "asc" | "desc";
}

const UserManagement: React.FC<UserManagementProps> = ({
  organizationId,
  isSuperAdmin = false,
  subscriptionPlan,
}) => {
  // Core state
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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
    role: "",
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
    invite: false,
    resetPassword: false,
  });

  // Form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    roleId: "",
    organizationId: organizationId || "",
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserForMenu, setSelectedUserForMenu] = useState<User | null>(null);

  // Mock data
  const mockUsers: User[] = [
    {
      id: "1",
      name: "John Admin",
      email: "john@example.com",
      organizationId: "org1",
      roleId: "admin",
      roleName: "Administrator",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      emailVerified: true,
      twoFactorEnabled: true,
    },
    {
      id: "2",
      name: "Jane Manager",
      email: "jane@example.com",
      organizationId: "org1",
      roleId: "manager",
      roleName: "Manager",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      emailVerified: true,
      twoFactorEnabled: false,
    },
    {
      id: "3",
      name: "Bob Viewer",
      email: "bob@example.com",
      organizationId: "org1",
      roleId: "viewer",
      roleName: "Viewer",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      emailVerified: true,
      twoFactorEnabled: false,
    },
    {
      id: "4",
      name: "Alice Inactive",
      email: "alice@example.com",
      organizationId: "org1",
      roleId: "viewer",
      roleName: "Viewer",
      isActive: false,
      createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      updatedAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      emailVerified: false,
      twoFactorEnabled: false,
    },
  ];

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
  ];

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadModules();
    loadOrganizations();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockUsers];

      if (filters.search) {
        filteredData = filteredData.filter((user) =>
          user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.organization && !isSuperAdmin) {
        filteredData = filteredData.filter((user) => user.organizationId === filters.organization);
      }

      if (filters.role) {
        filteredData = filteredData.filter((user) => user.roleId === filters.role);
      }

      if (filters.isActive !== "all") {
        filteredData = filteredData.filter((user) => 
          filters.isActive === "active" ? user.isActive : !user.isActive
        );
      }

      setUsers(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users. Please try again.");
      showSnackbar("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = () => {
    setRoles(mockRoles);
  };

  const loadModules = () => {
    setModules(mockModules);
  };

  const loadOrganizations = () => {
    setOrganizations(mockOrganizations);
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
      role: "",
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
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedUserForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedUserForMenu) {
      setViewingUser(selectedUserForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedUserForMenu) {
      openEditDialog(selectedUserForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedUserForMenu) {
      setViewingUser(selectedUserForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  const handlePermissionsAction = () => {
    if (selectedUserForMenu) {
      setViewingUser(selectedUserForMenu);
      setDialogs((prev) => ({ ...prev, permissions: true }));
    }
    handleActionClose();
  };

  const handleResetPasswordAction = () => {
    if (selectedUserForMenu) {
      setViewingUser(selectedUserForMenu);
      setDialogs((prev) => ({ ...prev, resetPassword: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateUser = async () => {
    try {
      setFormErrors({});
      
      // Validation
      const errors: Partial<UserFormData> = {};
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      if (!formData.email.includes("@")) errors.email = "Invalid email format";
      if (!formData.roleId) errors.roleId = "Role is required";
      if (!formData.organizationId) errors.organizationId = "Organization is required";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Check if email already exists
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        setFormErrors({ email: "User with this email already exists" });
        return;
      }

      const selectedRole = roles.find(r => r.id === formData.roleId);
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        organizationId: formData.organizationId,
        roleId: formData.roleId,
        roleName: selectedRole?.name || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        twoFactorEnabled: false,
      };

      showSnackbar("User created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ name: "", email: "", roleId: "", organizationId: organizationId || "" });
      loadUsers();
    } catch (error) {
      showSnackbar("Failed to create user", "error");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setFormErrors({});
      
      // Validation
      const errors: Partial<UserFormData> = {};
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      if (!formData.email.includes("@")) errors.email = "Invalid email format";
      if (!formData.roleId) errors.roleId = "Role is required";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Check if email already exists (excluding current user)
      if (users.some(u => u.id !== editingUser.id && u.email.toLowerCase() === formData.email.toLowerCase())) {
        setFormErrors({ email: "User with this email already exists" });
        return;
      }

      showSnackbar("User updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingUser(null);
      setFormData({ name: "", email: "", roleId: "", organizationId: organizationId || "" });
      loadUsers();
    } catch (error) {
      showSnackbar("Failed to update user", "error");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      showSnackbar("User deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadUsers();
    } catch (error) {
      showSnackbar("Failed to delete user", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      showSnackbar(
        `${selectedUsers.length} users deleted successfully`,
        "success",
      );
      setSelectedUsers([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadUsers();
    } catch (error) {
      showSnackbar("Failed to delete users", "error");
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      showSnackbar(
        `User ${user.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      loadUsers();
    } catch (error) {
      showSnackbar("Failed to update user status", "error");
    }
  };

  const handleSendInvite = async (user: User) => {
    try {
      showSnackbar("Invitation sent successfully", "success");
    } catch (error) {
      showSnackbar("Failed to send invitation", "error");
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      showSnackbar("Password reset email sent successfully", "success");
      setDialogs((prev) => ({ ...prev, resetPassword: false }));
    } catch (error) {
      showSnackbar("Failed to send password reset email", "error");
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      organizationId: user.organizationId,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getUserEffectivePermissions = (user: User) => {
    const userRole = roles.find(r => r.id === user.roleId);
    if (!userRole) return {};

    const effectivePermissions: Record<string, ModuleAction[]> = {};
    
    Object.entries(userRole.permissions).forEach(([moduleId, roleActions]) => {
      const subscriptionActions = subscriptionPlan?.modules[moduleId] || [];
      effectivePermissions[moduleId] = roleActions.filter(action => 
        subscriptionActions.includes(action)
      );
    });

    return effectivePermissions;
  };

  const getLastLoginText = (lastLogin?: string) => {
    if (!lastLogin) return "Never";
    const diff = Date.now() - new Date(lastLogin).getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return format(new Date(lastLogin), "MMM dd");
  };

  const getStatusColor = (user: User) => {
    if (!user.isActive) return "error";
    if (!user.emailVerified) return "warning";
    return "success";
  };

  const getStatusText = (user: User) => {
    if (!user.isActive) return "Inactive";
    if (!user.emailVerified) return "Pending";
    return "Active";
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Users", isActive: "all" as const },
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
              User Management
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Manage user accounts, roles, and permissions
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
                    placeholder="Search users..."
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

                {/* Role Filter */}
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                    label="Role"
                    className="bg-white"
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
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
                  variant="contained"
                  startIcon={<PersonAddIcon style={{ fontSize: '16px' }} />}
                  onClick={() => {
                    setFormData({ name: "", email: "", roleId: "", organizationId: organizationId || "" });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add User
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<SendIcon style={{ fontSize: '16px' }} />}
                  onClick={() => setDialogs((prev) => ({ ...prev, invite: true }))}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Invite
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadUsers}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={users.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedUsers.length > 0 && (
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
                    Delete ({selectedUsers.length})
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        users.length > 0 &&
                        selectedUsers.length === users.length
                      }
                      indeterminate={
                        selectedUsers.length > 0 &&
                        selectedUsers.length < users.length
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
                      User
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "email"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("email")}
                      className="font-semibold text-gray-700"
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "role"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("role")}
                      className="font-semibold text-gray-700"
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-700">Last Login</TableCell>
                  <TableCell className="font-semibold text-gray-700">Security</TableCell>
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
                {users.map((user) => {
                  const userRole = roles.find(r => r.id === user.roleId);
                  return (
                    <TableRow
                      key={user.id}
                      selected={selectedUsers.includes(user.id)}
                      hover
                      className="hover:bg-gray-50"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-blue-100 text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EmailIcon className="text-gray-400" style={{ fontSize: 16 }} />
                          <div>
                            <Typography variant="body2" className="text-gray-900">
                              {user.email}
                            </Typography>
                            {!user.emailVerified && (
                              <Typography variant="caption" className="text-orange-600">
                                Unverified
                              </Typography>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <GroupIcon className="text-purple-600" style={{ fontSize: 16 }} />
                          </div>
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {user.roleName}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {userRole?.description}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(user)}
                          color={getStatusColor(user)}
                          size="small"
                          icon={user.isActive && user.emailVerified ? <CheckCircleIcon style={{ fontSize: 14 }} /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {getLastLoginText(user.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.emailVerified && (
                            <Tooltip title="Email verified">
                              <CheckCircleIcon className="text-green-600" style={{ fontSize: 16 }} />
                            </Tooltip>
                          )}
                          {user.twoFactorEnabled && (
                            <Tooltip title="2FA enabled">
                              <VpnKeyIcon className="text-blue-600" style={{ fontSize: 16 }} />
                            </Tooltip>
                          )}
                          {!user.emailVerified && !user.twoFactorEnabled && (
                            <Tooltip title="Basic security">
                              <WarningIcon className="text-orange-400" style={{ fontSize: 16 }} />
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {user.createdAt
                            ? format(new Date(user.createdAt), "MMM dd, yyyy")
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center gap-1">
                          <Tooltip title={user.isActive ? "Deactivate user" : "Activate user"}>
                            <Switch
                              checked={user.isActive}
                              onChange={() => handleToggleUserStatus(user)}
                              size="small"
                            />
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionClick(e, user)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" className="py-12">
                      <div className="text-center">
                        <PersonIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No users found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first user
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
            <ListItemText>View Permissions</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <EditIcon fontSize="small" className="text-yellow-600" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleResetPasswordAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <VpnKeyIcon fontSize="small" className="text-purple-600" />
            </ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => selectedUserForMenu && handleSendInvite(selectedUserForMenu)} className="hover:bg-gray-50">
            <ListItemIcon>
              <SendIcon fontSize="small" className="text-blue-600" />
            </ListItemIcon>
            <ListItemText>Send Invite</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <DeleteIcon fontSize="small" className="text-red-600" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* User Form Dialogs */}
        {[
          { key: "create", title: "Create New User", action: handleCreateUser },
          { key: "edit", title: "Edit User", action: handleUpdateUser },
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
                  label="Full Name"
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
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
                <FormControl fullWidth error={!!formErrors.roleId}>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, roleId: e.target.value }))
                    }
                    label="Role *"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <div>
                          <Typography variant="body2">{role.name}</Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {role.description}
                          </Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.roleId && (
                    <Typography variant="caption" className="text-red-600 mt-1 ml-3">
                      {formErrors.roleId}
                    </Typography>
                  )}
                </FormControl>
                
                {isSuperAdmin && (
                  <FormControl fullWidth error={!!formErrors.organizationId}>
                    <InputLabel>Organization *</InputLabel>
                    <Select
                      value={formData.organizationId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, organizationId: e.target.value }))
                      }
                      label="Organization *"
                    >
                      {organizations.map((org) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.organizationId && (
                      <Typography variant="caption" className="text-red-600 mt-1 ml-3">
                        {formErrors.organizationId}
                      </Typography>
                    )}
                  </FormControl>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogs((prev) => ({ ...prev, [key]: false }))}
              >
                Cancel
              </Button>
              <Button onClick={action} variant="contained">
                {key === "create" ? "Create User" : "Update User"}
              </Button>
            </DialogActions>
          </Dialog>
        ))}

        {/* View User Dialog */}
        <Dialog
          open={dialogs.view}
          onClose={() => setDialogs((prev) => ({ ...prev, view: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 bg-blue-100 text-blue-600">
                {viewingUser?.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Typography variant="h6">{viewingUser?.name}</Typography>
                <Typography variant="body2" className="text-gray-600">
                  User Details
                </Typography>
              </div>
            </div>
          </DialogTitle>
          <DialogContent>
            {viewingUser && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Email
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography variant="body2" className="text-gray-700">
                        {viewingUser.email}
                      </Typography>
                      {viewingUser.emailVerified ? (
                        <CheckCircleIcon className="text-green-600" style={{ fontSize: 16 }} />
                      ) : (
                        <WarningIcon className="text-orange-400" style={{ fontSize: 16 }} />
                      )}
                    </div>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Role
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingUser.roleName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Status
                    </Typography>
                    <Chip
                      label={getStatusText(viewingUser)}
                      color={getStatusColor(viewingUser)}
                      size="small"
                    />
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Last Login
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {getLastLoginText(viewingUser.lastLogin)}
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Security Settings
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon 
                        className={viewingUser.emailVerified ? "text-green-600" : "text-gray-300"} 
                        style={{ fontSize: 16 }} 
                      />
                      <Typography variant="body2">
                        Email Verified
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <VpnKeyIcon 
                        className={viewingUser.twoFactorEnabled ? "text-blue-600" : "text-gray-300"} 
                        style={{ fontSize: 16 }} 
                      />
                      <Typography variant="body2">
                        Two-Factor Authentication
                      </Typography>
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Effective Permissions
                  </Typography>
                  <div className="space-y-2">
                    {Object.entries(getUserEffectivePermissions(viewingUser)).map(([moduleId, actions]) => {
                      const module = modules.find(m => m.id === moduleId);
                      return (
                        <div key={moduleId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                              <ExtensionIcon style={{ fontSize: 14 }} />
                            </div>
                            <Typography variant="body2" className="font-medium">
                              {module?.displayName || moduleId}
                            </Typography>
                          </div>
                          <div className="flex gap-1">
                            {actions.map((action) => (
                              <Chip
                                key={action}
                                label={action}
                                size="small"
                                variant="outlined"
                                className="text-xs"
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Created
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingUser.createdAt ? format(new Date(viewingUser.createdAt), "PPP") : "Unknown"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {viewingUser.updatedAt ? format(new Date(viewingUser.updatedAt), "PPP") : "Unknown"}
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
              startIcon={<EditIcon />}
              onClick={() => {
                if (viewingUser) {
                  setDialogs((prev) => ({ ...prev, view: false }));
                  openEditDialog(viewingUser);
                }
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Other dialogs would be added here... */}

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

export default UserManagement;
