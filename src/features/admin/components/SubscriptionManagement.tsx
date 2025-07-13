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
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Divider,
  FormGroup,
  OutlinedInput,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Extension as ModuleIcon,
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    description: "",
    price: 0,
    validity: 30,
    modules: [],
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [errors, setErrors] = useState<Partial<SubscriptionFormData>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load subscriptions and active modules
      // Use mock data for now
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

  const handleDialogOpen = (subscription?: Subscription) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name,
        description: subscription.description || "",
        price: subscription.price,
        validity: subscription.validity,
        modules: subscription.modules,
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        validity: 30,
        modules: [],
      });
    }
    setErrors({});
    setSelectedModuleId("");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSubscription(null);
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

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.validity <= 0) {
      newErrors.validity = "Validity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingSubscription) {
        // Update existing subscription
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
      } else {
        // Create new subscription
        const newSubscription: Subscription = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };

        setSubscriptions([...subscriptions, newSubscription]);
        showSnackbar("Subscription created successfully", "success");
      }

      handleDialogClose();
    } catch (error) {
      showSnackbar("Failed to save subscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscription?"))
      return;

    setLoading(true);
    try {
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
      showSnackbar("Subscription deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete subscription", "error");
    } finally {
      setLoading(false);
    }
  };

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
      permissions: { ...DEFAULT_PERMISSIONS },
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

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Subscription Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
          size="large"
        >
          Add Subscription
        </Button>
      </Box>

      {/* Subscriptions Grid */}
      <Grid container spacing={3}>
        {subscriptions.map((subscription) => (
          <Grid item xs={12} md={6} lg={4} key={subscription.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {subscription.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  component="div"
                >
                  {subscription.description || "No description"}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <MoneyIcon fontSize="small" color="primary" />
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ${subscription.price}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {subscription.validity} days validity
                  </Typography>
                </Box>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Modules ({subscription.modules.length}):
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {subscription.modules.slice(0, 3).map((module) => (
                      <Chip
                        key={module.module_id}
                        label={module.module_name}
                        size="small"
                        variant="outlined"
                        icon={<ModuleIcon fontSize="small" />}
                      />
                    ))}
                    {subscription.modules.length > 3 && (
                      <Chip
                        label={`+${subscription.modules.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleDialogOpen(subscription)}
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteSubscription(subscription.id)}
                  disabled={loading}
                  color="error"
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {subscriptions.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No subscriptions available. Create your first subscription to
                get started.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSubscription
            ? "Edit Subscription"
            : "Create New Subscription"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
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
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  margin="normal"
                  multiline
                  rows={2}
                  placeholder="Optional description of the subscription..."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Module Selection */}
            <Typography variant="h6" gutterBottom>
              Module Configuration
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <FormControl sx={{ minWidth: 200 }}>
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
            </Box>

            {/* Selected Modules Table */}
            {formData.modules.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module Name</TableCell>
                      <TableCell align="center">View</TableCell>
                      <TableCell align="center">Create</TableCell>
                      <TableCell align="center">Edit</TableCell>
                      <TableCell align="center">Delete</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.modules.map((module) => (
                      <TableRow key={module.module_id}>
                        <TableCell>
                          <Typography variant="subtitle2">
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
            )}

            {formData.modules.length === 0 && (
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", mt: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  No modules selected. Add modules to configure permissions.
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingSubscription
              ? "Update Subscription"
              : "Create Subscription"}
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
