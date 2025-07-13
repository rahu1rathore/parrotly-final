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
  Switch,
  FormControlLabel,
  Checkbox,
  Fab,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  AddCircle as AddFieldIcon,
  RemoveCircle as RemoveFieldIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Customer,
  CustomerFormData,
  FormConfiguration,
  FormField,
  Organization,
} from "../types";
import {
  customerAPI,
  formConfigurationAPI,
  mockCustomers,
  mockFormConfigurations,
  mockOrganizations,
} from "../services/api";

interface CustomerManagementProps {
  onCustomersChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  organization: string;
  [key: string]: any; // Dynamic filters based on form fields
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onCustomersChange,
}) => {
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formConfigurations, setFormConfigurations] = useState<
    FormConfiguration[]
  >([]);
  const [selectedFormConfig, setSelectedFormConfig] =
    useState<FormConfiguration | null>(null);
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
    organization: "all",
  });

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Selected items
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    organization_id: "",
    form_configuration_id: "",
    phone_number: "",
    data: {},
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form configuration editing state
  const [editingFormConfig, setEditingFormConfig] =
    useState<FormConfiguration | null>(null);
  const [formConfigData, setFormConfigData] = useState<
    Partial<FormConfiguration>
  >({
    name: "",
    description: "",
    organization_id: "",
    fields: [],
  });

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomerForMenu, setSelectedCustomerForMenu] =
    useState<Customer | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadCustomers();
    loadOrganizations();
    loadFormConfigurations();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Simulate API call with filters and pagination
      let filteredData = [...mockCustomers];

      // Apply filters
      if (filters.search) {
        filteredData = filteredData.filter((customer) => {
          const searchTerm = filters.search.toLowerCase();
          return (
            customer.phone_number.toLowerCase().includes(searchTerm) ||
            customer.organization_name?.toLowerCase().includes(searchTerm) ||
            Object.values(customer.data).some((value) =>
              String(value).toLowerCase().includes(searchTerm),
            )
          );
        });
      }

      if (filters.organization !== "all") {
        filteredData = filteredData.filter(
          (customer) => customer.organization_id === filters.organization,
        );
      }

      // Apply dynamic filters based on form fields
      Object.keys(filters).forEach((key) => {
        if (
          key !== "search" &&
          key !== "organization" &&
          filters[key] !== "" &&
          filters[key] !== "all"
        ) {
          filteredData = filteredData.filter((customer) => {
            const value = customer.data[key];
            if (typeof value === "boolean") {
              return filters[key] === "true" ? value : !value;
            }
            return String(value)
              .toLowerCase()
              .includes(String(filters[key]).toLowerCase());
          });
        }
      });

      const total = filteredData.length;
      const startIndex = pagination.page * pagination.rowsPerPage;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pagination.rowsPerPage,
      );

      setCustomers(paginatedData);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
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
      if (mockFormConfigurations.length > 0) {
        setSelectedFormConfig(mockFormConfigurations[0]);
      }
    } catch (error) {
      showSnackbar("Failed to load form configurations", "error");
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
    const clearedFilters: FilterState = {
      search: "",
      organization: "all",
    };

    // Clear dynamic filters
    if (selectedFormConfig) {
      selectedFormConfig.fields.forEach((field) => {
        clearedFilters[field.name] = "";
      });
    }

    setFilters(clearedFilters);
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
    customer: Customer,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomerForMenu(customer);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedCustomerForMenu(null);
  };

  const handleView = () => {
    if (selectedCustomerForMenu) {
      setViewingCustomer(selectedCustomerForMenu);
      setViewDialogOpen(true);
    }
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedCustomerForMenu) {
      setEditingCustomer(selectedCustomerForMenu);
      setFormData({
        organization_id: selectedCustomerForMenu.organization_id,
        form_configuration_id: selectedCustomerForMenu.form_configuration_id,
        phone_number: selectedCustomerForMenu.phone_number,
        data: selectedCustomerForMenu.data,
      });
      setEditDialogOpen(true);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (selectedCustomerForMenu) {
      setDeletingCustomer(selectedCustomerForMenu);
      setDeleteDialogOpen(true);
    }
    handleActionClose();
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!formData.organization_id) {
      newErrors.organization_id = "Organization is required";
    }

    if (!formData.form_configuration_id) {
      newErrors.form_configuration_id = "Form configuration is required";
    }

    // Validate dynamic fields
    const formConfig = formConfigurations.find(
      (fc) => fc.id === formData.form_configuration_id,
    );
    if (formConfig) {
      formConfig.fields.forEach((field) => {
        if (field.required && !formData.data[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }

        if (field.type === "email" && formData.data[field.name]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.data[field.name])) {
            newErrors[field.name] = "Please enter a valid email address";
          }
        }

        if (field.validation) {
          const value = formData.data[field.name];
          if (
            value &&
            field.validation.minLength &&
            value.length < field.validation.minLength
          ) {
            newErrors[field.name] =
              `Minimum length is ${field.validation.minLength} characters`;
          }
          if (
            value &&
            field.validation.maxLength &&
            value.length > field.validation.maxLength
          ) {
            newErrors[field.name] =
              `Maximum length is ${field.validation.maxLength} characters`;
          }
          if (value && field.validation.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(value)) {
              newErrors[field.name] = "Invalid format";
            }
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedOrg = organizations.find(
        (org) => org.id === formData.organization_id,
      );
      const selectedFormConfig = formConfigurations.find(
        (fc) => fc.id === formData.form_configuration_id,
      );

      const newCustomer: Customer = {
        id: Date.now().toString(),
        organization_id: formData.organization_id,
        organization_name: selectedOrg?.name,
        form_configuration_id: formData.form_configuration_id,
        phone_number: formData.phone_number,
        data: formData.data,
        created_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await customerAPI.create(formData);

      showSnackbar("Customer created successfully", "success");
      setCreateDialogOpen(false);
      resetForm();
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to create customer", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingCustomer) return;

    setLoading(true);
    try {
      const selectedOrg = organizations.find(
        (org) => org.id === formData.organization_id,
      );

      const updatedCustomer = {
        ...editingCustomer,
        organization_id: formData.organization_id,
        organization_name: selectedOrg?.name,
        form_configuration_id: formData.form_configuration_id,
        phone_number: formData.phone_number,
        data: formData.data,
        updated_at: new Date().toISOString(),
      };

      // In real app, make API call
      // await customerAPI.update(editingCustomer.id, formData);

      showSnackbar("Customer updated successfully", "success");
      setEditDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to update customer", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    setLoading(true);
    try {
      // In real app, make API call
      // await customerAPI.delete(deletingCustomer.id);

      showSnackbar("Customer deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDeletingCustomer(null);
      loadCustomers();
      onCustomersChange?.();
    } catch (error) {
      showSnackbar("Failed to delete customer", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      organization_id: "",
      form_configuration_id: "",
      phone_number: "",
      data: {},
    });
    setErrors({});
  };

  // Form configuration management
  const handleCreateFormConfig = () => {
    setEditingFormConfig(null);
    setFormConfigData({
      name: "",
      description: "",
      organization_id: "",
      fields: [
        {
          id: Date.now().toString(),
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          order: 1,
        },
      ],
    });
    setConfigDialogOpen(true);
  };

  const handleEditFormConfig = (config: FormConfiguration) => {
    setEditingFormConfig(config);
    setFormConfigData(config);
    setConfigDialogOpen(true);
  };

  const handleSaveFormConfig = async () => {
    setLoading(true);
    try {
      if (editingFormConfig) {
        // Update existing form configuration
        showSnackbar("Form configuration updated successfully", "success");
      } else {
        // Create new form configuration
        showSnackbar("Form configuration created successfully", "success");
      }
      setConfigDialogOpen(false);
      loadFormConfigurations();
    } catch (error) {
      showSnackbar("Failed to save form configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${formConfigData.fields?.length || 0 + 1}`,
      label: `Field ${(formConfigData.fields?.length || 0) + 1}`,
      type: "text",
      required: false,
      order: (formConfigData.fields?.length || 0) + 1,
    };

    setFormConfigData((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));
  };

  const removeFormField = (fieldId: string) => {
    setFormConfigData((prev) => ({
      ...prev,
      fields: prev.fields?.filter((field) => field.id !== fieldId) || [],
    }));
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setFormConfigData((prev) => ({
      ...prev,
      fields:
        prev.fields?.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field,
        ) || [],
    }));
  };

  // Dynamic form rendering
  const renderFormField = (
    field: FormField,
    value: any,
    onChange: (value: any) => void,
    disabled = false,
  ) => {
    const fieldProps = {
      fullWidth: true,
      label: field.label,
      value: value || "",
      onChange: (e: any) => onChange(e.target.value),
      error: !!errors[field.name],
      helperText: errors[field.name],
      required: field.required,
      disabled,
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case "text":
        return <TextField {...fieldProps} />;
      case "email":
        return <TextField {...fieldProps} type="email" />;
      case "number":
        return <TextField {...fieldProps} type="number" />;
      case "textarea":
        return <TextField {...fieldProps} multiline rows={3} />;
      case "select":
        return (
          <FormControl
            fullWidth
            error={!!errors[field.name]}
            disabled={disabled}
          >
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              value={value || ""}
              label={field.label}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name] && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 2 }}
              >
                {errors[field.name]}
              </Typography>
            )}
          </FormControl>
        );
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={field.label}
          />
        );
      case "date":
        return (
          <DatePicker
            label={field.label}
            value={value ? dayjs(value) : null}
            onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[field.name],
                helperText: errors[field.name],
                required: field.required,
                disabled,
              },
            }}
          />
        );
      default:
        return <TextField {...fieldProps} />;
    }
  };

  // Get dynamic table columns based on current form configuration
  const getTableColumns = () => {
    const baseColumns = [
      { id: "phone_number", label: "Phone Number", sortable: true },
      { id: "organization_name", label: "Organization", sortable: true },
    ];

    if (selectedFormConfig) {
      const dynamicColumns = selectedFormConfig.fields
        .sort((a, b) => a.order - b.order)
        .map((field) => ({
          id: field.name,
          label: field.label,
          sortable: true,
          type: field.type,
        }));

      return [
        ...baseColumns,
        ...dynamicColumns,
        { id: "actions", label: "Actions", sortable: false },
      ];
    }

    return [
      ...baseColumns,
      { id: "actions", label: "Actions", sortable: false },
    ];
  };

  // Render cell value based on field type
  const renderCellValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "boolean":
        return (
          <Chip
            label={value ? "Yes" : "No"}
            color={value ? "success" : "default"}
            size="small"
          />
        );
      case "date":
        return dayjs(value).format("MMM DD, YYYY");
      case "email":
        return (
          <Typography variant="body2" sx={{ color: "primary.main" }}>
            {value}
          </Typography>
        );
      case "select":
        return <Chip label={value} size="small" variant="outlined" />;
      default:
        return String(value);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", p: 0, m: 0 }}>
        {/* Header with Tabs */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab label="Customer Management" />
              <Tab label="Form Configuration" />
            </Tabs>

            <Stack direction="row" spacing={2}>
              {tabValue === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="large"
                >
                  Add Customer
                </Button>
              )}
              {tabValue === 1 && (
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  onClick={handleCreateFormConfig}
                  size="large"
                >
                  Create Form Config
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Customer Management Tab */}
        {tabValue === 0 && (
          <>
            {/* Form Configuration Selector */}
            <Card sx={{ mb: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <SettingsIcon color="action" />
                  <Typography variant="h6">
                    Active Form Configuration
                  </Typography>
                </Stack>

                <FormControl sx={{ minWidth: 300 }}>
                  <InputLabel>Select Form Configuration</InputLabel>
                  <Select
                    value={selectedFormConfig?.id || ""}
                    label="Select Form Configuration"
                    onChange={(e) => {
                      const config = formConfigurations.find(
                        (fc) => fc.id === e.target.value,
                      );
                      setSelectedFormConfig(config || null);
                    }}
                  >
                    {formConfigurations.map((config) => (
                      <MenuItem key={config.id} value={config.id}>
                        {config.name} ({config.organization_name})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedFormConfig && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFormConfig.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {selectedFormConfig.fields.map((field) => (
                        <Chip
                          key={field.id}
                          label={field.label}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Filters */}
            <Card sx={{ mb: 3, boxShadow: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <FilterListIcon color="action" />
                  <Typography variant="h6">Filters</Typography>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </Stack>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Search customers"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Search by phone, organization, or data..."
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Organization</InputLabel>
                      <Select
                        value={filters.organization}
                        label="Organization"
                        onChange={(e) =>
                          handleFilterChange("organization", e.target.value)
                        }
                      >
                        <MenuItem value="all">All Organizations</MenuItem>
                        {organizations.map((org) => (
                          <MenuItem key={org.id} value={org.id}>
                            {org.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Dynamic filters based on form configuration */}
                  {selectedFormConfig?.fields
                    .filter(
                      (field) =>
                        field.type === "select" || field.type === "boolean",
                    )
                    .slice(0, 2) // Limit to 2 dynamic filters to fit in the row
                    .map((field) => (
                      <Grid item xs={12} md={3} key={field.id}>
                        <FormControl fullWidth>
                          <InputLabel>{field.label}</InputLabel>
                          <Select
                            value={filters[field.name] || ""}
                            label={field.label}
                            onChange={(e) =>
                              handleFilterChange(field.name, e.target.value)
                            }
                          >
                            <MenuItem value="">All {field.label}</MenuItem>
                            {field.type === "boolean" ? (
                              <>
                                <MenuItem value="true">Yes</MenuItem>
                                <MenuItem value="false">No</MenuItem>
                              </>
                            ) : (
                              field.options?.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}

                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadCustomers}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Dynamic Customers Table */}
            <Card sx={{ boxShadow: 1 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "grey.50" }}>
                      {getTableColumns().map((column) => (
                        <TableCell key={column.id} sx={{ fontWeight: 600 }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={getTableColumns().length}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography>Loading customers...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={getTableColumns().length}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {Object.values(filters).some(
                              (f) => f !== "all" && f !== "",
                            )
                              ? "No customers found matching your criteria"
                              : "No customers available. Add your first customer to get started."}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => {
                        const columns = getTableColumns();
                        return (
                          <TableRow
                            key={customer.id}
                            hover
                            sx={{ "&:hover": { backgroundColor: "grey.50" } }}
                          >
                            {columns.map((column) => {
                              if (column.id === "actions") {
                                return (
                                  <TableCell key={column.id}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) =>
                                        handleActionClick(e, customer)
                                      }
                                      sx={{ color: "text.secondary" }}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </TableCell>
                                );
                              } else if (column.id === "phone_number") {
                                return (
                                  <TableCell key={column.id}>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={1}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          backgroundColor: "primary.main",
                                        }}
                                      >
                                        <PersonIcon sx={{ fontSize: 18 }} />
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {customer.phone_number}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                );
                              } else if (column.id === "organization_name") {
                                return (
                                  <TableCell key={column.id}>
                                    <Typography variant="body2">
                                      {customer.organization_name || "-"}
                                    </Typography>
                                  </TableCell>
                                );
                              } else {
                                // Dynamic field
                                const value = customer.data[column.id];
                                return (
                                  <TableCell key={column.id}>
                                    {renderCellValue(
                                      value,
                                      column.type || "text",
                                    )}
                                  </TableCell>
                                );
                              }
                            })}
                          </TableRow>
                        );
                      })
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
          </>
        )}

        {/* Form Configuration Tab */}
        {tabValue === 1 && (
          <Card sx={{ boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Form Configurations
              </Typography>

              {formConfigurations.map((config) => (
                <Accordion key={config.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <BusinessIcon color="action" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {config.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {config.organization_name} • {config.fields.length}{" "}
                          fields
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFormConfig(config);
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {config.description}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      Form Fields:
                    </Typography>
                    <Stack spacing={1}>
                      {config.fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                          <Box
                            key={field.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Chip
                              label={field.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="body2">
                              <strong>{field.label}</strong> ({field.name})
                              {field.required && (
                                <span style={{ color: "red" }}> *</span>
                              )}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}

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

        {/* Create Customer Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Organization Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.organization_id}
                >
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={formData.organization_id}
                    label="Organization"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        organization_id: e.target.value,
                      });
                      // Auto-select form configuration if only one exists for this org
                      const orgConfigs = formConfigurations.filter(
                        (fc) => fc.organization_id === e.target.value,
                      );
                      if (orgConfigs.length === 1) {
                        setFormData((prev) => ({
                          ...prev,
                          form_configuration_id: orgConfigs[0].id,
                        }));
                      }
                    }}
                  >
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.organization_id && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.organization_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Form Configuration Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.form_configuration_id}
                >
                  <InputLabel>Form Configuration</InputLabel>
                  <Select
                    value={formData.form_configuration_id}
                    label="Form Configuration"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        form_configuration_id: e.target.value,
                        data: {},
                      });
                    }}
                    disabled={!formData.organization_id}
                  >
                    {formConfigurations
                      .filter(
                        (fc) => fc.organization_id === formData.organization_id,
                      )
                      .map((config) => (
                        <MenuItem key={config.id} value={config.id}>
                          {config.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.form_configuration_id && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.form_configuration_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Phone Number - Editable during creation */}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Dynamic Form Fields */}
              {formData.form_configuration_id && (
                <>
                  <Grid item xs={12}>
                    <Divider>
                      <Typography variant="body2" color="text.secondary">
                        Customer Information
                      </Typography>
                    </Divider>
                  </Grid>

                  {formConfigurations
                    .find((fc) => fc.id === formData.form_configuration_id)
                    ?.fields.sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <Grid item xs={12} md={6} key={field.id}>
                        {renderFormField(
                          field,
                          formData.data[field.name],
                          (value) =>
                            setFormData((prev) => ({
                              ...prev,
                              data: { ...prev.data, [field.name]: value },
                            })),
                        )}
                      </Grid>
                    ))}
                </>
              )}
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
              Create Customer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Organization Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.organization_id}
                >
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={formData.organization_id}
                    label="Organization"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization_id: e.target.value,
                      })
                    }
                  >
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.organization_id && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.organization_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Form Configuration Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.form_configuration_id}
                >
                  <InputLabel>Form Configuration</InputLabel>
                  <Select
                    value={formData.form_configuration_id}
                    label="Form Configuration"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        form_configuration_id: e.target.value,
                      })
                    }
                  >
                    {formConfigurations
                      .filter(
                        (fc) => fc.organization_id === formData.organization_id,
                      )
                      .map((config) => (
                        <MenuItem key={config.id} value={config.id}>
                          {config.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.form_configuration_id && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.form_configuration_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Phone Number - Read-only during editing */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone_number}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Phone number cannot be changed during editing"
                />
              </Grid>

              {/* Dynamic Form Fields */}
              {formData.form_configuration_id && (
                <>
                  <Grid item xs={12}>
                    <Divider>
                      <Typography variant="body2" color="text.secondary">
                        Customer Information
                      </Typography>
                    </Divider>
                  </Grid>

                  {formConfigurations
                    .find((fc) => fc.id === formData.form_configuration_id)
                    ?.fields.sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <Grid item xs={12} md={6} key={field.id}>
                        {renderFormField(
                          field,
                          formData.data[field.name],
                          (value) =>
                            setFormData((prev) => ({
                              ...prev,
                              data: { ...prev.data, [field.name]: value },
                            })),
                        )}
                      </Grid>
                    ))}
                </>
              )}
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
              Update Customer
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Customer Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Customer Details</DialogTitle>
          <DialogContent>
            {viewingCustomer && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="h6">
                        {viewingCustomer.phone_number}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Organization
                      </Typography>
                      <Typography variant="body1">
                        {viewingCustomer.organization_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(
                          viewingCustomer.created_at || "",
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Customer Information
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(viewingCustomer.data).map(
                      ([key, value]) => {
                        const formConfig = formConfigurations.find(
                          (fc) =>
                            fc.id === viewingCustomer.form_configuration_id,
                        );
                        const field = formConfig?.fields.find(
                          (f) => f.name === key,
                        );
                        return (
                          <Box key={key}>
                            <Typography variant="body2" fontWeight={500}>
                              {field?.label || key}:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {renderCellValue(value, field?.type || "text")}
                            </Typography>
                          </Box>
                        );
                      },
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

        {/* Form Configuration Dialog */}
        <Dialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editingFormConfig
              ? "Edit Form Configuration"
              : "Create Form Configuration"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Configuration Name"
                  value={formConfigData.name}
                  onChange={(e) =>
                    setFormConfigData({
                      ...formConfigData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={formConfigData.organization_id}
                    label="Organization"
                    onChange={(e) =>
                      setFormConfigData({
                        ...formConfigData,
                        organization_id: e.target.value,
                      })
                    }
                  >
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formConfigData.description}
                  onChange={(e) =>
                    setFormConfigData({
                      ...formConfigData,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Form Fields</Typography>
                  <Button
                    startIcon={<AddFieldIcon />}
                    onClick={addFormField}
                    variant="outlined"
                  >
                    Add Field
                  </Button>
                </Box>

                {formConfigData.fields?.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, mb: 2 }} variant="outlined">
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <DragIcon color="action" />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Field Name"
                          value={field.name}
                          onChange={(e) =>
                            updateFormField(field.id, { name: e.target.value })
                          }
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Label"
                          value={field.label}
                          onChange={(e) =>
                            updateFormField(field.id, { label: e.target.value })
                          }
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={field.type}
                            label="Type"
                            onChange={(e) =>
                              updateFormField(field.id, {
                                type: e.target.value as any,
                              })
                            }
                          >
                            <MenuItem value="text">Text</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="phone">Phone</MenuItem>
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="select">Select</MenuItem>
                            <MenuItem value="textarea">Textarea</MenuItem>
                            <MenuItem value="boolean">Boolean</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Placeholder"
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateFormField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} sm={1}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.required}
                              onChange={(e) =>
                                updateFormField(field.id, {
                                  required: e.target.checked,
                                })
                              }
                            />
                          }
                          label="Required"
                        />
                      </Grid>

                      <Grid item>
                        <IconButton
                          onClick={() => removeFormField(field.id)}
                          color="error"
                          size="small"
                        >
                          <RemoveFieldIcon />
                        </IconButton>
                      </Grid>

                      {field.type === "select" && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Options (comma-separated)"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) =>
                              updateFormField(field.id, {
                                options: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            size="small"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfigDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFormConfig}
              variant="contained"
              disabled={loading}
            >
              {editingFormConfig
                ? "Update Configuration"
                : "Create Configuration"}
            </Button>
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
              Are you sure you want to delete this customer? This action cannot
              be undone.
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

export default CustomerManagement;
