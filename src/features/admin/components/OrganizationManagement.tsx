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
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Organization,
  OrganizationFormData,
  FilterStatus,
  Subscription,
} from "../types";
import {
  organizationAPI,
  mockOrganizations,
  mockSubscriptions,
} from "../services/api";

interface OrganizationManagementProps {
  onOrganizationsChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  country: string;
  subscription: string;
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({
  onOrganizationsChange,
}) => {
  // Data state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
    country: "all",
    subscription: "all",
  });

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Selected items
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [deletingOrganization, setDeletingOrganization] =
    useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] =
    useState<Organization | null>(null);

  // Form state
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
  });
  const [errors, setErrors] = useState<Partial<OrganizationFormData>>({});

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrganizationForMenu, setSelectedOrganizationForMenu] =
    useState<Organization | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Countries list for filtering
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
  ];

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    loadOrganizations();
    loadSubscriptions();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      // Simulate API call with filters and pagination
      let filteredData = [...mockOrganizations];

      // Apply filters
      if (filters.search) {
        filteredData = filteredData.filter(
          (org) =>
            org.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            org.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            (org.description &&
              org.description
                .toLowerCase()
                .includes(filters.search.toLowerCase())),
        );
      }

      if (filters.country !== "all") {
        filteredData = filteredData.filter(
          (org) => org.country === filters.country,
        );
      }

      if (filters.subscription !== "all") {
        filteredData = filteredData.filter(
          (org) => org.subscription_id === filters.subscription,
        );
      }

      const total = filteredData.length;
      const startIndex = pagination.page * pagination.rowsPerPage;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pagination.rowsPerPage,
      );

      setOrganizations(paginatedData);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      showSnackbar("Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      showSnackbar("Failed to load subscriptions", "error");
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
      country: "all",
      subscription: "all",
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
    organization: Organization,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrganizationForMenu(organization);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedOrganizationForMenu(null);
  };

  const handleView = () => {
    if (selectedOrganizationForMenu) {
      setViewingOrganization(selectedOrganizationForMenu);
      setViewDialogOpen(true);
    }
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedOrganizationForMenu) {
      setEditingOrganization(selectedOrganizationForMenu);
      setFormData({
        name: selectedOrganizationForMenu.name,
        description: selectedOrganizationForMenu.description || "",
        address: selectedOrganizationForMenu.address,
        city: selectedOrganizationForMenu.city,
        state: selectedOrganizationForMenu.state,
        country: selectedOrganizationForMenu.country,
        postal_code: selectedOrganizationForMenu.postal_code,
        email: selectedOrganizationForMenu.email,
        website: selectedOrganizationForMenu.website || "",
        established_date: selectedOrganizationForMenu.established_date,
        logo: selectedOrganizationForMenu.logo || "",
        phone_number: selectedOrganizationForMenu.phone_number,
        subscription_id: selectedOrganizationForMenu.subscription_id || "",
      });
      setEditDialogOpen(true);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (selectedOrganizationForMenu) {
      setDeletingOrganization(selectedOrganizationForMenu);
      setDeleteDialogOpen(true);
    }
    handleActionClose();
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<OrganizationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedSubscription = subscriptions.find(
        (s) => s.id === formData.subscription_id,
      );

      const newOrganization: Organization = {
        id: Date.now().toString(),
        ...formData,
        subscription_name: selectedSubscription?.name,
        created_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await organizationAPI.create(formData);

      showSnackbar("Organization created successfully", "success");
      setCreateDialogOpen(false);
      resetForm();
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to create organization", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingOrganization) return;

    setLoading(true);
    try {
      const selectedSubscription = subscriptions.find(
        (s) => s.id === formData.subscription_id,
      );

      const updatedOrganization = {
        ...editingOrganization,
        ...formData,
        subscription_name: selectedSubscription?.name,
        updated_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await organizationAPI.update(editingOrganization.id, formData);

      showSnackbar("Organization updated successfully", "success");
      setEditDialogOpen(false);
      setEditingOrganization(null);
      resetForm();
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to update organization", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingOrganization) return;

    setLoading(true);
    try {
      // In real app, make API call
      // await organizationAPI.delete(deletingOrganization.id);

      showSnackbar("Organization deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDeletingOrganization(null);
      loadOrganizations();
      onOrganizationsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete organization", "error");
    } finally {
      setLoading(false);
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
    });
    setErrors({});
  };

  // Helper function to get organization avatar
  const getOrganizationAvatar = (org: Organization) => {
    if (org.logo) {
      return (
        <Avatar src={org.logo} sx={{ width: 40, height: 40 }}>
          {org.name.charAt(0).toUpperCase()}
        </Avatar>
      );
    }
    return (
      <Avatar
        sx={{
          width: 40,
          height: 40,
          backgroundColor: "primary.main",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        {org.name.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", p: 0, m: 0 }}>
        {/* Create Button */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            Add Organization
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
                  filters.country === "all" &&
                  filters.subscription === "all"
                }
              >
                Clear All
              </Button>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search organizations"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by name, email or description..."
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={filters.country}
                    label="Country"
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                  >
                    <MenuItem value="all">All Countries</MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Subscription</InputLabel>
                  <Select
                    value={filters.subscription}
                    label="Subscription"
                    onChange={(e) =>
                      handleFilterChange("subscription", e.target.value)
                    }
                  >
                    <MenuItem value="all">All Subscriptions</MenuItem>
                    {subscriptions.map((subscription) => (
                      <MenuItem key={subscription.id} value={subscription.id}>
                        {subscription.name}
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
                  onClick={loadOrganizations}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card sx={{ boxShadow: 1 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subscription</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Established</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography>Loading organizations...</Typography>
                    </TableCell>
                  </TableRow>
                ) : organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Object.values(filters).some(
                          (f) => f !== "all" && f !== "",
                        )
                          ? "No organizations found matching your criteria"
                          : "No organizations available. Add your first organization to get started."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((organization) => (
                    <TableRow
                      key={organization.id}
                      hover
                      sx={{ "&:hover": { backgroundColor: "grey.50" } }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {getOrganizationAvatar(organization)}
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {organization.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {organization.description || "No description"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <EmailIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {organization.email}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <PhoneIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {organization.phone_number}
                            </Typography>
                          </Stack>
                          {organization.website && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <WebsiteIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Link
                                href={organization.website}
                                target="_blank"
                                variant="body2"
                              >
                                Website
                              </Link>
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={500}>
                            {organization.city}, {organization.state}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {organization.country}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {organization.subscription_name ? (
                          <Chip
                            label={organization.subscription_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No subscription
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(
                            organization.established_date,
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
                          onClick={(e) => handleActionClick(e, organization)}
                          sx={{ color: "text.secondary" }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
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

        {/* Create Organization Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Add New Organization</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the organization..."
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  error={!!errors.website}
                  helperText={errors.website}
                  placeholder="https://www.example.com"
                />
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  error={!!errors.city}
                  helperText={errors.city}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  error={!!errors.state}
                  helperText={errors.state}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  error={!!errors.postal_code}
                  helperText={errors.postal_code}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.country}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country}
                    label="Country"
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.country && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.country}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Established Date"
                  value={
                    formData.established_date
                      ? new Date(formData.established_date)
                      : null
                  }
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      established_date: date
                        ? date.toISOString().split("T")[0]
                        : "",
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Subscription Plan</InputLabel>
                  <Select
                    value={formData.subscription_id}
                    label="Subscription Plan"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscription_id: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">No Subscription</MenuItem>
                    {subscriptions.map((subscription) => (
                      <MenuItem key={subscription.id} value={subscription.id}>
                        {subscription.name} - ${subscription.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                  InputProps={{
                    endAdornment: formData.logo && (
                      <InputAdornment position="end">
                        <Avatar
                          src={formData.logo}
                          sx={{ width: 24, height: 24 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              disabled={loading}
            >
              Create Organization
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Organization Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogContent>
            {/* Same content as create dialog but with existing values */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the organization..."
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  error={!!errors.website}
                  helperText={errors.website}
                  placeholder="https://www.example.com"
                />
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  error={!!errors.city}
                  helperText={errors.city}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  error={!!errors.state}
                  helperText={errors.state}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  error={!!errors.postal_code}
                  helperText={errors.postal_code}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.country}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country}
                    label="Country"
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.country && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.country}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Established Date"
                  value={
                    formData.established_date
                      ? new Date(formData.established_date)
                      : null
                  }
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      established_date: date
                        ? date.toISOString().split("T")[0]
                        : "",
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Subscription Plan</InputLabel>
                  <Select
                    value={formData.subscription_id}
                    label="Subscription Plan"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscription_id: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">No Subscription</MenuItem>
                    {subscriptions.map((subscription) => (
                      <MenuItem key={subscription.id} value={subscription.id}>
                        {subscription.name} - ${subscription.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                  InputProps={{
                    endAdornment: formData.logo && (
                      <InputAdornment position="end">
                        <Avatar
                          src={formData.logo}
                          sx={{ width: 24, height: 24 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={loading}
            >
              Update Organization
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Organization Details</DialogTitle>
          <DialogContent>
            {viewingOrganization && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Organization Name
                      </Typography>
                      <Typography variant="h6">
                        {viewingOrganization.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {viewingOrganization.description ||
                          "No description provided"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {viewingOrganization.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">
                        {viewingOrganization.phone_number}
                      </Typography>
                    </Box>
                    {viewingOrganization.website && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Website
                        </Typography>
                        <Link
                          href={viewingOrganization.website}
                          target="_blank"
                          variant="body1"
                        >
                          {viewingOrganization.website}
                        </Link>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {viewingOrganization.address}
                        <br />
                        {viewingOrganization.city}, {viewingOrganization.state}{" "}
                        {viewingOrganization.postal_code}
                        <br />
                        {viewingOrganization.country}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Established Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(
                          viewingOrganization.established_date,
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Subscription Plan
                      </Typography>
                      {viewingOrganization.subscription_name ? (
                        <Chip
                          label={viewingOrganization.subscription_name}
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No subscription
                        </Typography>
                      )}
                    </Box>
                    {viewingOrganization.logo && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Logo
                        </Typography>
                        <Avatar
                          src={viewingOrganization.logo}
                          sx={{ width: 80, height: 80 }}
                        >
                          {viewingOrganization.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
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
              Are you sure you want to delete the organization "
              {deletingOrganization?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
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
    </LocalizationProvider>
  );
};

export default OrganizationManagement;
