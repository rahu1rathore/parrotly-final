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
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Customer, CustomerFormData, Organization, FormConfiguration } from "../types";
import { customerAPI, mockCustomers, mockOrganizations, mockFormConfigurations } from "../services/api";

interface CustomerManagementStandardizedProps {
  onCustomersChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  status: "all" | "active" | "inactive";
  organization: string;
  sortBy: "phone_number" | "organization_name" | "created_at";
  sortOrder: "asc" | "desc";
}

const CustomerManagementStandardized: React.FC<CustomerManagementStandardizedProps> = ({
  onCustomersChange,
}) => {
  // Core state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formConfigurations, setFormConfigurations] = useState<FormConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

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
    organization: "",
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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    organization_id: "",
    form_configuration_id: "",
    phone_number: "",
    data: {},
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomerForMenu, setSelectedCustomerForMenu] = useState<Customer | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadCustomers();
    loadOrganizations();
    loadFormConfigurations();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // API functions
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: filters.search,
        organization: filters.organization,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      // Simulate API call with filters
      let filteredData = [...mockCustomers];

      if (filters.search) {
        filteredData = filteredData.filter((customer) => {
          const searchTerm = filters.search.toLowerCase();
          return (
            customer.phone_number.toLowerCase().includes(searchTerm) ||
            customer.organization_name?.toLowerCase().includes(searchTerm) ||
            Object.values(customer.data).some((value) =>
              String(value).toLowerCase().includes(searchTerm)
            )
          );
        });
      }

      if (filters.organization) {
        filteredData = filteredData.filter(
          (customer) => customer.organization_id === filters.organization
        );
      }

      setCustomers(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading customers:", error);
      setError("Failed to load customers. Please try again.");
      showSnackbar("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      setOrganizations(mockOrganizations);
    } catch (error) {
      showSnackbar("Failed to load organizations", "error");
    }
  };

  const loadFormConfigurations = async () => {
    try {
      setFormConfigurations(mockFormConfigurations);
    } catch (error) {
      showSnackbar("Failed to load form configurations", "error");
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
      organization: "",
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
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.id));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomerForMenu(customer);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedCustomerForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedCustomerForMenu) {
      setViewingCustomer(selectedCustomerForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedCustomerForMenu) {
      openEditDialog(selectedCustomerForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedCustomerForMenu) {
      setViewingCustomer(selectedCustomerForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateCustomer = async () => {
    try {
      setFormErrors({});
      if (!formData.phone_number.trim()) {
        setFormErrors({ phone_number: "Phone number is required" });
        return;
      }

      const selectedOrg = organizations.find((org) => org.id === formData.organization_id);
      const newCustomer: Customer = {
        id: Date.now().toString(),
        organization_id: formData.organization_id,
        organization_name: selectedOrg?.name,
        form_configuration_id: formData.form_configuration_id,
        phone_number: formData.phone_number,
        data: formData.data,
        created_at: new Date().toISOString(),
      };

      showSnackbar("Customer created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ organization_id: "", form_configuration_id: "", phone_number: "", data: {} });
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to create customer", "error");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      setFormErrors({});
      if (!formData.phone_number.trim()) {
        setFormErrors({ phone_number: "Phone number is required" });
        return;
      }

      showSnackbar("Customer updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingCustomer(null);
      setFormData({ organization_id: "", form_configuration_id: "", phone_number: "", data: {} });
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to update customer", "error");
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      showSnackbar("Customer deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to delete customer", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      showSnackbar(
        `${selectedCustomers.length} customers deleted successfully`,
        "success",
      );
      setSelectedCustomers([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to delete customers", "error");
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      organization_id: customer.organization_id,
      form_configuration_id: customer.form_configuration_id,
      phone_number: customer.phone_number,
      data: customer.data,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Customers", status: "all" as const },
    { label: "Active", status: "active" as const },
    { label: "Inactive", status: "inactive" as const },
  ];

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
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
                        key={filter.status}
                        onClick={() => handleFilterChange("status", filter.status)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          filters.status === filter.status
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
                    placeholder="Search customers..."
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

                {/* Organization Filter */}
                <FormControl size="small" className="min-w-[140px]">
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={filters.organization}
                    onChange={(e) => handleFilterChange("organization", e.target.value)}
                    label="Organization"
                    className="bg-white"
                  >
                    <MenuItem value="">All</MenuItem>
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort By */}
                <FormControl size="small" className="min-w-[100px]">
                  <InputLabel>Sort</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    label="Sort"
                    className="bg-white"
                  >
                    <MenuItem value="phone_number">Phone</MenuItem>
                    <MenuItem value="organization_name">Organization</MenuItem>
                    <MenuItem value="created_at">Created</MenuItem>
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
                  startIcon={<AddIcon style={{ fontSize: '16px' }} />}
                  onClick={() => {
                    setFormData({ organization_id: "", form_configuration_id: "", phone_number: "", data: {} });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Customer
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadCustomers}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={customers.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedCustomers.length > 0 && (
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
                    Delete ({selectedCustomers.length})
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
                        customers.length > 0 &&
                        selectedCustomers.length === customers.length
                      }
                      indeterminate={
                        selectedCustomers.length > 0 &&
                        selectedCustomers.length < customers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "phone_number"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("phone_number")}
                      className="font-semibold text-gray-700"
                    >
                      Customer Info
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "organization_name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("organization_name")}
                      className="font-semibold text-gray-700"
                    >
                      Organization
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Form Config</TableCell>
                  <TableCell className="font-semibold text-gray-700">Customer Data</TableCell>
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
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    selected={selectedCustomers.includes(customer.id)}
                    hover
                    className="hover:bg-gray-50"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          <PhoneIcon style={{ fontSize: '16px' }} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.phone_number}</div>
                          <div className="text-sm text-gray-500">Customer ID: {customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BusinessIcon style={{ fontSize: '16px' }} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {customer.organization_name || "No Organization"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-gray-600">
                        {formConfigurations.find(fc => fc.id === customer.form_configuration_id)?.name || "No Config"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(customer.data).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                        {Object.keys(customer.data).length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{Object.keys(customer.data).length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-gray-600">
                        {customer.created_at
                          ? format(new Date(customer.created_at), "MMM dd, yyyy")
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, customer)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-12">
                      <div className="text-center">
                        <PersonIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No customers found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first customer
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
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
              }
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number}
              className="mb-4"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Organization</InputLabel>
              <Select
                value={formData.organization_id}
                label="Organization"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, organization_id: e.target.value }))
                }
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} variant="contained">
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
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
              }
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number}
              className="mb-4"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Organization</InputLabel>
              <Select
                value={formData.organization_id}
                label="Organization"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, organization_id: e.target.value }))
                }
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} variant="contained">
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
          <DialogTitle>Customer Details</DialogTitle>
          <DialogContent>
            {viewingCustomer && (
              <Stack spacing={3}>
                <TextField
                  label="Phone Number"
                  value={viewingCustomer.phone_number}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Organization"
                  value={viewingCustomer.organization_name || "No organization"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Created"
                  value={
                    viewingCustomer.created_at
                      ? format(new Date(viewingCustomer.created_at), "PPP")
                      : "—"
                  }
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, view: false }))}
            >
              Close
            </Button>
            {viewingCustomer && (
              <Button
                onClick={() => openEditDialog(viewingCustomer)}
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
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingCustomer?.phone_number}"? This action
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
              onClick={() => viewingCustomer && handleDeleteCustomer(viewingCustomer)}
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
          <DialogTitle>Delete Selected Customers</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedCustomers.length} selected
              customers? This action cannot be undone.
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
              Delete {selectedCustomers.length} Customers
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

export default CustomerManagementStandardized;
