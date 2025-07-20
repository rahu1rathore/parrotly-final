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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Extension as ExtensionIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { SubscriptionPlan, SubscriptionPlanFormData, ModuleDefinition, ModuleAction } from "../types/rbac";

interface SubscriptionPlanCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (planData: SubscriptionPlanFormData) => void;
  editingPlan?: SubscriptionPlan | null;
  modules: ModuleDefinition[];
}

const SubscriptionPlanCreator: React.FC<SubscriptionPlanCreatorProps> = ({
  open,
  onClose,
  onSave,
  editingPlan,
  modules,
}) => {
  const [formData, setFormData] = useState<SubscriptionPlanFormData>({
    planName: "",
    description: "",
    price: 0,
    billingCycle: "monthly",
    maxUsers: undefined,
    modules: {},
    features: [],
  });

  const [errors, setErrors] = useState<Partial<SubscriptionPlanFormData>>({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [customFeature, setCustomFeature] = useState("");

  const steps = ["Basic Info", "Module Permissions", "Features & Limits", "Review"];

  const predefinedFeatures = [
    "API Access",
    "Custom Branding",
    "Advanced Analytics",
    "Priority Support",
    "Data Export",
    "Single Sign-On (SSO)",
    "Mobile App Access",
    "Webhook Integrations",
    "Custom Reports",
    "Backup & Recovery",
    "Multi-language Support",
    "Advanced Security",
  ];

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planName: editingPlan.planName,
        description: editingPlan.description || "",
        price: editingPlan.price,
        billingCycle: editingPlan.billingCycle,
        maxUsers: editingPlan.maxUsers,
        modules: editingPlan.modules,
        features: editingPlan.features,
      });
    } else {
      resetForm();
    }
  }, [editingPlan, open]);

  const resetForm = () => {
    setFormData({
      planName: "",
      description: "",
      price: 0,
      billingCycle: "monthly",
      maxUsers: undefined,
      modules: {},
      features: [],
    });
    setErrors({});
    setActiveStep(0);
    setPreviewMode(false);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<SubscriptionPlanFormData> = {};

    if (step === 0) {
      if (!formData.planName.trim()) {
        newErrors.planName = "Plan name is required";
      }
      if (formData.price < 0) {
        newErrors.price = "Price cannot be negative";
      }
    }

    if (step === 1) {
      const hasAnyPermissions = Object.keys(formData.modules).some(
        moduleId => formData.modules[moduleId].length > 0
      );
      if (!hasAnyPermissions) {
        // Show warning but don't block
        console.warn("No module permissions selected");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleModulePermissionToggle = (moduleId: string, action: ModuleAction) => {
    setFormData(prev => {
      const currentActions = prev.modules[moduleId] || [];
      const newActions = currentActions.includes(action)
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action];

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: newActions,
        },
      };
    });
  };

  const handleSelectAllActionsForModule = (moduleId: string, allActions: ModuleAction[]) => {
    setFormData(prev => {
      const currentActions = prev.modules[moduleId] || [];
      const hasAllActions = allActions.every(action => currentActions.includes(action));

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: hasAllActions ? [] : allActions,
        },
      };
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, customFeature.trim()],
      }));
      setCustomFeature("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const handleSave = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving subscription plan:", error);
    } finally {
      setLoading(false);
    }
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

  const getTotalModulesWithPermissions = () => {
    return Object.keys(formData.modules).filter(
      moduleId => formData.modules[moduleId].length > 0
    ).length;
  };

  const renderBasicInfo = () => (
    <Stack spacing={3}>
      <Typography variant="h6" className="mb-4">Basic Plan Information</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Plan Name"
            value={formData.planName}
            onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
            error={!!errors.planName}
            helperText={errors.planName}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Billing Cycle</InputLabel>
            <Select
              value={formData.billingCycle}
              label="Billing Cycle"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                billingCycle: e.target.value as "monthly" | "yearly" 
              }))}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Max Users"
            type="number"
            value={formData.maxUsers || ""}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maxUsers: e.target.value ? Number(e.target.value) : undefined 
            }))}
            helperText="Leave empty for unlimited users"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            helperText="Brief description of what this plan includes"
          />
        </Grid>
      </Grid>
    </Stack>
  );

  const renderModulePermissions = () => {
    const modulesByCategory = modules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {} as Record<string, ModuleDefinition[]>);

    return (
      <Stack spacing={3}>
        <div className="flex justify-between items-center">
          <Typography variant="h6">Module Permissions</Typography>
          <Chip 
            label={`${getTotalModulesWithPermissions()} modules configured`}
            color="primary"
            variant="outlined"
          />
        </div>

        {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              className="bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <Typography variant="subtitle1" className="font-semibold">
                  {category} Modules
                </Typography>
                <Badge 
                  badgeContent={categoryModules.filter(m => 
                    formData.modules[m.id]?.length > 0
                  ).length}
                  color="primary"
                />
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {categoryModules.map((module) => {
                  const selectedActions = formData.modules[module.id] || [];
                  const hasAllActions = module.availableActions.every(action => 
                    selectedActions.includes(action)
                  );

                  return (
                    <Card key={module.id} variant="outlined">
                      <CardContent className="py-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              {getCategoryIcon(module.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Typography variant="subtitle1" className="font-semibold">
                                  {module.displayName}
                                </Typography>
                                {module.isCore && (
                                  <Chip size="small" label="Core" color="error" />
                                )}
                              </div>
                              <Typography variant="body2" className="text-gray-600">
                                {module.description}
                              </Typography>
                              {module.dependencies && module.dependencies.length > 0 && (
                                <div className="mt-1">
                                  <Typography variant="caption" className="text-gray-500">
                                    Depends on: {module.dependencies.join(", ")}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </div>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={hasAllActions}
                                onChange={() => handleSelectAllActionsForModule(
                                  module.id, 
                                  module.availableActions
                                )}
                                color="primary"
                              />
                            }
                            label="All Actions"
                            className="ml-2"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {module.availableActions.map((action) => {
                            const isSelected = selectedActions.includes(action);
                            return (
                              <FormControlLabel
                                key={action}
                                control={
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleModulePermissionToggle(module.id, action)}
                                    size="small"
                                  />
                                }
                                label={
                                  <div className="flex items-center gap-1">
                                    {getActionIcon(action)}
                                    <span className="capitalize text-sm">{action}</span>
                                  </div>
                                }
                              />
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    );
  };

  const renderFeaturesAndLimits = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Additional Features</Typography>
      
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" className="mb-3 font-semibold">
            Available Features
          </Typography>
          <Grid container spacing={1}>
            {predefinedFeatures.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                  }
                  label={feature}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" className="mb-3 font-semibold">
            Custom Features
          </Typography>
          <div className="flex gap-2 mb-3">
            <TextField
              fullWidth
              size="small"
              placeholder="Add custom feature..."
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddCustomFeature();
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={handleAddCustomFeature}
              disabled={!customFeature.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features
              .filter(feature => !predefinedFeatures.includes(feature))
              .map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  onDelete={() => handleRemoveFeature(feature)}
                  color="primary"
                  variant="outlined"
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderReview = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Review Plan Configuration</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" className="mb-3 font-semibold">
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Plan Name:</Typography>
                  <Typography variant="body2" className="font-medium">{formData.planName}</Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Price:</Typography>
                  <Typography variant="body2" className="font-medium">
                    ${formData.price}/{formData.billingCycle === "monthly" ? "month" : "year"}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Max Users:</Typography>
                  <Typography variant="body2" className="font-medium">
                    {formData.maxUsers || "Unlimited"}
                  </Typography>
                </div>
                {formData.description && (
                  <div>
                    <Typography variant="body2" color="text.secondary">Description:</Typography>
                    <Typography variant="body2" className="mt-1">{formData.description}</Typography>
                  </div>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" className="mb-3 font-semibold">
                Module Summary
              </Typography>
              <div className="space-y-2">
                {Object.entries(formData.modules)
                  .filter(([, actions]) => actions.length > 0)
                  .map(([moduleId, actions]) => {
                    const module = modules.find(m => m.id === moduleId);
                    return (
                      <div key={moduleId} className="flex justify-between items-center">
                        <Typography variant="body2">{module?.displayName}</Typography>
                        <div className="flex gap-1">
                          {actions.map(action => (
                            <Chip 
                              key={action} 
                              label={action} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </Grid>

        {formData.features.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" className="mb-3 font-semibold">
                  Included Features
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map(feature => (
                    <Chip 
                      key={feature} 
                      label={feature} 
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Stack>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderBasicInfo();
      case 1: return renderModulePermissions();
      case 2: return renderFeaturesAndLimits();
      case 3: return renderReview();
      default: return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: { minHeight: "80vh" }
      }}
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <Typography variant="h6">
            {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        {!previewMode && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === activeStep
                        ? "bg-blue-600 text-white"
                        : index < activeStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index < activeStep ? <CheckCircleIcon style={{ fontSize: 20 }} /> : index + 1}
                  </div>
                  <Typography
                    variant="caption"
                    className={`ml-2 ${index === activeStep ? "font-semibold" : ""}`}
                  >
                    {step}
                  </Typography>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${index < activeStep ? "bg-green-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {previewMode ? renderReview() : renderStepContent()}
      </DialogContent>

      <DialogActions className="p-4">
        {!previewMode && (
          <>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={activeStep === steps.length - 1 ? handleSave : handleNext}
              variant="contained"
              disabled={loading}
              startIcon={activeStep === steps.length - 1 ? <SaveIcon /> : undefined}
            >
              {loading ? "Saving..." : activeStep === steps.length - 1 ? "Save Plan" : "Next"}
            </Button>
          </>
        )}
        {previewMode && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? "Saving..." : "Save Plan"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionPlanCreator;
