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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Chip,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Extension as ModuleIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Diamond as DiamondIcon,
} from "@mui/icons-material";
import {
  Subscription,
  SubscriptionFormData,
  Module,
  ModulePermission,
  Permission,
} from "../types";
import {
  subscriptionAPI,
  moduleAPI,
  mockSubscriptions,
  mockModules,
} from "../services/api";

const DEFAULT_PERMISSIONS: Permission = {
  view: false,
  edit: false,
  delete: false,
  create: false,
};

const SubscriptionManagement: React.FC = () => {
  // Data state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Selected items
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] =
    useState<Subscription | null>(null);

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    description: "",
    price: 0,
    validity: 30,
    modules: [],
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [errors, setErrors] = useState<Partial<SubscriptionFormData>>({});

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSubscriptionForMenu, setSelectedSubscriptionForMenu] =
    useState<Subscription | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Step labels for create/edit wizard
  const steps = ["Basic Information", "Module Configuration", "Review & Save"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setSubscriptions(mockSubscriptions);
      setModules(mockModules.filter((m) => m.is_active));
    } catch (error) {
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Action menu handlers
  const handleActionClick = (
    event: React.MouseEvent<HTMLElement>,
    subscription: Subscription,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubscriptionForMenu(subscription);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedSubscriptionForMenu(null);
  };

  const handleView = () => {
    if (selectedSubscriptionForMenu) {
      setViewingSubscription(selectedSubscriptionForMenu);
      setViewDialogOpen(true);
    }
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedSubscriptionForMenu) {
      setEditingSubscription(selectedSubscriptionForMenu);
      setFormData({
        name: selectedSubscriptionForMenu.name,
        description: selectedSubscriptionForMenu.description || "",
        price: selectedSubscriptionForMenu.price,
        validity: selectedSubscriptionForMenu.validity,
        modules: selectedSubscriptionForMenu.modules,
      });
      setActiveStep(0);
      setEditDialogOpen(true);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (selectedSubscriptionForMenu) {
      setDeletingSubscription(selectedSubscriptionForMenu);
      setDeleteDialogOpen(true);
    }
    handleActionClose();
  };

  // Form handlers
  const handleCreateOpen = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      validity: 30,
      modules: [],
    });
    setErrors({});
    setSelectedModuleId("");
    setActiveStep(0);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingSubscription(null);
    setActiveStep(0);
    setFormData({
      name: "",
      description: "",
      price: 0,
      validity: 30,
      modules: [],
    });
    setErrors({});
    setSelectedModuleId("");
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = "Subscription name is required";
      }
      if (formData.price <= 0) {
        newErrors.price = "Price must be greater than 0";
      }
      if (formData.validity <= 0) {
        newErrors.validity = "Validity must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(0)) return;

    setLoading(true);
    try {
      if (editingSubscription) {
        const updatedSubscription = {
          ...editingSubscription,
          ...formData,
          updated_at: new Date().toISOString(),
        };
        setSubscriptions(
          subscriptions.map((s) =>
            s.id === editingSubscription.id ? updatedSubscription : s,
          ),
        );
        showSnackbar("Subscription updated successfully", "success");
        setEditDialogOpen(false);
      } else {
        const newSubscription: Subscription = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        setSubscriptions([...subscriptions, newSubscription]);
        showSnackbar("Subscription created successfully", "success");
        setCreateDialogOpen(false);
      }
      handleDialogClose();
    } catch (error) {
      showSnackbar("Failed to save subscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSubscription) return;

    setLoading(true);
    try {
      setSubscriptions(
        subscriptions.filter((s) => s.id !== deletingSubscription.id),
      );
      showSnackbar("Subscription deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDeletingSubscription(null);
    } catch (error) {
      showSnackbar("Failed to delete subscription", "error");
    } finally {
      setLoading(false);
    }
  };

  // Module management functions
  const addModuleToSubscription = () => {
    if (!selectedModuleId) return;

    const module = modules.find((m) => m.id === selectedModuleId);
    if (!module) return;

    const moduleExists = formData.modules.find(
      (m) => m.module_id === selectedModuleId,
    );
    if (moduleExists) {
      showSnackbar("Module already added to this subscription", "error");
      return;
    }

    const newModulePermission: ModulePermission = {
      module_id: module.id,
      module_name: module.name,
      permissions: { ...DEFAULT_PERMISSIONS, view: true }, // Default to view permission
    };

    setFormData({
      ...formData,
      modules: [...formData.modules, newModulePermission],
    });
    setSelectedModuleId("");
  };

  const removeModuleFromSubscription = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((m) => m.module_id !== moduleId),
    });
  };

  const updateModulePermissions = (
    moduleId: string,
    permission: keyof Permission,
    value: boolean,
  ) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((m) =>
        m.module_id === moduleId
          ? {
              ...m,
              permissions: {
                ...m.permissions,
                [permission]: value,
              },
            }
          : m,
      ),
    });
  };

  const availableModules = modules.filter(
    (m) => !formData.modules.find((fm) => fm.module_id === m.id),
  );

  // Helper functions
  const getSubscriptionIcon = (index: number) => {
    const icons = [<StarIcon />, <BusinessIcon />, <DiamondIcon />];
    return icons[index % icons.length];
  };

  const getSubscriptionColor = (index: number) => {
    const colors = ["#1976d2", "#388e3c", "#f57c00"];
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ width: "100%", p: 0, m: 0 }}>
      {/* Create Button */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          size="large"
        >
          Create Subscription
        </Button>
      </Box>

      {/* Subscriptions Grid - Full Width */}
      <Grid container spacing={3}>
        {subscriptions.map((subscription, index) => (
          <Grid item xs={12} key={subscription.id}>
            <Card
              sx={{
                width: "100%",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={3} alignItems="flex-start">
                  {/* Subscription Icon */}
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: getSubscriptionColor(index),
                      fontSize: "1.5rem",
                    }}
                  >
                    {getSubscriptionIcon(index)}
                  </Avatar>

                  {/* Main Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          fontWeight={600}
                          gutterBottom
                        >
                          {subscription.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {subscription.description ||
                            "No description provided"}
                        </Typography>
                      </Box>

                      {/* Action Menu */}
                      <IconButton
                        onClick={(e) => handleActionClick(e, subscription)}
                        sx={{ color: "text.secondary" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Stack>

                    {/* Subscription Details */}
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={4} md={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MoneyIcon color="primary" />
                          <Box>
                            <Typography
                              variant="h4"
                              color="primary"
                              fontWeight={700}
                            >
                              ${subscription.price}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              per subscription
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4} md={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon color="action" />
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {subscription.validity}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              days validity
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4} md={8}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1 }}
                        >
                          <ModuleIcon color="action" />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Modules ({subscription.modules.length})
                          </Typography>
                        </Stack>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {subscription.modules.slice(0, 4).map((module) => (
                            <Chip
                              key={module.module_id}
                              label={module.module_name}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          ))}
                          {subscription.modules.length > 4 && (
                            <Chip
                              label={`+${subscription.modules.length - 4} more`}
                              size="small"
                              variant="filled"
                              color="primary"
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </CardContent>

              <Divider />

              <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
                <Button
                  startIcon={<ViewIcon />}
                  onClick={() => {
                    setViewingSubscription(subscription);
                    setViewDialogOpen(true);
                  }}
                  disabled={loading}
                >
                  View Details
                </Button>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit()}
                  disabled={loading}
                  variant="outlined"
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {subscriptions.length === 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{ p: 6, textAlign: "center", backgroundColor: "grey.50" }}
            >
              <StarIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No subscriptions available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first subscription plan to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateOpen}
                size="large"
              >
                Create First Subscription
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

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

      {/* Create/Edit Dialog with Stepper */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingSubscription
            ? "Edit Subscription"
            : "Create New Subscription"}
        </DialogTitle>
        <DialogContent>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{ mt: 2 }}
          >
            {/* Step 1: Basic Information */}
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Subscription Name"
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
                      label="Price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      error={!!errors.price}
                      helperText={errors.price}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Validity (Days)"
                      type="number"
                      value={formData.validity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validity: parseInt(e.target.value) || 0,
                        })
                      }
                      error={!!errors.validity}
                      helperText={errors.validity}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      multiline
                      rows={3}
                      placeholder="Describe what this subscription includes..."
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mb: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mr: 1 }}
                  >
                    Continue
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Module Configuration */}
            <Step>
              <StepLabel>Module Configuration</StepLabel>
              <StepContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Select modules and configure permissions for this subscription
                  plan.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Add Module</InputLabel>
                    <Select
                      value={selectedModuleId}
                      label="Add Module"
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                    >
                      {availableModules.map((module) => (
                        <MenuItem key={module.id} value={module.id}>
                          {module.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={addModuleToSubscription}
                    disabled={!selectedModuleId}
                  >
                    Add Module
                  </Button>
                </Stack>

                {/* Module Permissions Table */}
                {formData.modules.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Module Name
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            View
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            Create
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            Edit
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            Delete
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.modules.map((module) => (
                          <TableRow key={module.module_id}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={500}>
                                {module.module_name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={module.permissions.view}
                                onChange={(e) =>
                                  updateModulePermissions(
                                    module.module_id,
                                    "view",
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={module.permissions.create}
                                onChange={(e) =>
                                  updateModulePermissions(
                                    module.module_id,
                                    "create",
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={module.permissions.edit}
                                onChange={(e) =>
                                  updateModulePermissions(
                                    module.module_id,
                                    "edit",
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={module.permissions.delete}
                                onChange={(e) =>
                                  updateModulePermissions(
                                    module.module_id,
                                    "delete",
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() =>
                                  removeModuleFromSubscription(module.module_id)
                                }
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "grey.50",
                    }}
                  >
                    <ModuleIcon
                      sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                    />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      No modules selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add modules to configure permissions for this
                      subscription.
                    </Typography>
                  </Paper>
                )}

                <Box sx={{ mb: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button onClick={handleBack}>Back</Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review & Save */}
            <Step>
              <StepLabel>Review & Save</StepLabel>
              <StepContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Review your subscription details before saving.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Subscription Details
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {formData.name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Price
                          </Typography>
                          <Typography variant="body1">
                            ${formData.price}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Validity
                          </Typography>
                          <Typography variant="body1">
                            {formData.validity} days
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Description
                          </Typography>
                          <Typography variant="body1">
                            {formData.description || "No description"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Module Permissions
                      </Typography>
                      {formData.modules.length > 0 ? (
                        <Stack spacing={1}>
                          {formData.modules.map((module) => (
                            <Box key={module.module_id}>
                              <Typography variant="subtitle2">
                                {module.module_name}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                {Object.entries(module.permissions)
                                  .filter(([_, value]) => value)
                                  .map(([permission]) => (
                                    <Chip
                                      key={permission}
                                      label={permission}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  ))}
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No modules configured
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {editingSubscription
                      ? "Update Subscription"
                      : "Create Subscription"}
                  </Button>
                  <Button onClick={handleBack}>Back</Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
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
        <DialogTitle>Subscription Details</DialogTitle>
        <DialogContent>
          {viewingSubscription && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="h6">
                      {viewingSubscription.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {viewingSubscription.description ||
                        "No description provided"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight={600}>
                      ${viewingSubscription.price}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Validity Period
                    </Typography>
                    <Typography variant="body1">
                      {viewingSubscription.validity} days
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
                  Included Modules ({viewingSubscription.modules.length})
                </Typography>
                <Stack spacing={1}>
                  {viewingSubscription.modules.map((module) => (
                    <Paper
                      key={module.module_id}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {module.module_name}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {Object.entries(module.permissions)
                          .filter(([_, value]) => value)
                          .map(([permission]) => (
                            <Chip
                              key={permission}
                              label={permission}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                      </Box>
                    </Paper>
                  ))}
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
            Are you sure you want to delete the subscription "
            {deletingSubscription?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
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
  );
};

export default SubscriptionManagement;
