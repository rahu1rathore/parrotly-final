import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Group as GroupIcon,
  ArrowForward as NextIcon,
} from "@mui/icons-material";
import { ChatbotFlowFormData } from "../types";

interface ChatbotFlowCreatorProps {
  onSubmit: (data: ChatbotFlowFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const accessPermissionOptions = [
  {
    value: "public",
    label: "Public",
    icon: <PublicIcon />,
    description: "Anyone can trigger this flow",
  },
  {
    value: "private",
    label: "Private",
    icon: <PrivateIcon />,
    description: "Only you can use this flow",
  },
  {
    value: "role_based",
    label: "Role-based",
    icon: <GroupIcon />,
    description: "Specific roles can access this flow",
  },
];

const roleOptions = [
  "admin",
  "manager",
  "agent",
  "support",
  "sales",
  "marketing",
];

const categoryOptions = [
  "general",
  "sales",
  "support",
  "marketing",
  "onboarding",
  "product",
  "feedback",
  "other",
];

export default function ChatbotFlowCreator({
  onSubmit,
  onCancel,
  loading,
}: ChatbotFlowCreatorProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ChatbotFlowFormData>({
    name: "",
    description: "",
    trigger_keywords: [],
    tags: [],
    category: "",
    access_permissions: "public",
    allowed_roles: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState("");
  const [newTag, setNewTag] = useState("");

  const steps = ["Basic Information", "Triggers & Access", "Review & Create"];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = "Flow name is required";
      }
      if (formData.name.length > 100) {
        newErrors.name = "Flow name must be 100 characters or less";
      }
      if (formData.description && formData.description.length > 500) {
        newErrors.description = "Description must be 500 characters or less";
      }
    }

    if (step === 1) {
      if (formData.trigger_keywords.length === 0) {
        newErrors.trigger_keywords = "At least one trigger keyword is required";
      }
      if (
        formData.access_permissions === "role_based" &&
        formData.allowed_roles!.length === 0
      ) {
        newErrors.allowed_roles =
          "At least one role must be selected for role-based access";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onSubmit(formData);
    }
  };

  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !formData.trigger_keywords.includes(newKeyword.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        trigger_keywords: [
          ...prev.trigger_keywords,
          newKeyword.trim().toLowerCase(),
        ],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      trigger_keywords: prev.trigger_keywords.filter((k) => k !== keyword),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Flow Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  error={!!errors.name}
                  helperText={
                    errors.name ||
                    "Enter a descriptive name for your chatbot flow"
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  error={!!errors.description}
                  helperText={
                    errors.description ||
                    "Briefly describe what this flow does (optional)"
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Choose a category to organize your flows
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Trigger Keywords
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addKeyword}
                    startIcon={<AddIcon />}
                    disabled={!newKeyword.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {formData.trigger_keywords.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() => removeKeyword(keyword)}
                      deleteIcon={<CloseIcon />}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
                {errors.trigger_keywords && (
                  <FormHelperText error>
                    {errors.trigger_keywords}
                  </FormHelperText>
                )}
                <FormHelperText>
                  Users can trigger this flow by typing these keywords (e.g.,
                  "hello", "help", "start")
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    startIcon={<AddIcon />}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<CloseIcon />}
                      variant="filled"
                      color="secondary"
                      size="small"
                    />
                  ))}
                </Box>
                <FormHelperText>
                  Tags help organize and filter your flows (optional)
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Access Permissions
                </Typography>
                <Grid container spacing={2}>
                  {accessPermissionOptions.map((option) => (
                    <Grid item xs={12} md={4} key={option.value}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          border:
                            formData.access_permissions === option.value
                              ? 2
                              : 1,
                          borderColor:
                            formData.access_permissions === option.value
                              ? "primary.main"
                              : "divider",
                          "&:hover": { borderColor: "primary.main" },
                        }}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            access_permissions: option.value as any,
                          }))
                        }
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          {option.icon}
                          <Typography
                            variant="subtitle1"
                            sx={{ ml: 1, fontWeight: 500 }}
                          >
                            {option.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {formData.access_permissions === "role_based" && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth error={!!errors.allowed_roles}>
                      <InputLabel>Allowed Roles</InputLabel>
                      <Select
                        multiple
                        value={formData.allowed_roles || []}
                        label="Allowed Roles"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            allowed_roles:
                              typeof e.target.value === "string"
                                ? [e.target.value]
                                : e.target.value,
                          }))
                        }
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((role) => (
                              <Chip key={role} label={role} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {roleOptions.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.allowed_roles && (
                        <FormHelperText>{errors.allowed_roles}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review your flow configuration below. After creating, you'll be
              taken to the visual editor to build your conversation flow.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{formData.name}</Typography>
                    </Box>
                    {formData.description && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {formData.description}
                        </Typography>
                      </Box>
                    )}
                    {formData.category && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {formData.category.charAt(0).toUpperCase() +
                            formData.category.slice(1)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Triggers & Access
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Trigger Keywords
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {formData.trigger_keywords.map((keyword) => (
                          <Chip
                            key={keyword}
                            label={keyword}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>

                    {formData.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Tags
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {formData.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Access
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                      >
                        {
                          accessPermissionOptions.find(
                            (opt) => opt.value === formData.access_permissions,
                          )?.icon
                        }
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          {
                            accessPermissionOptions.find(
                              (opt) =>
                                opt.value === formData.access_permissions,
                            )?.label
                          }
                        </Typography>
                      </Box>
                      {formData.access_permissions === "role_based" &&
                        formData.allowed_roles && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Allowed Roles
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {formData.allowed_roles.map((role) => (
                                <Chip key={role} label={role} size="small" />
                              ))}
                            </Box>
                          </Box>
                        )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Chatbot Flow
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a new conversation flow for your chatbot. You'll be able to
        design the conversation using our visual editor in the next step.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {renderStepContent(activeStep)}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={activeStep === 0 ? onCancel : handleBack}
              variant="outlined"
              disabled={loading}
            >
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>

            <Button
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }
              variant="contained"
              endIcon={
                activeStep === steps.length - 1 ? undefined : <NextIcon />
              }
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : activeStep === steps.length - 1
                  ? "Create Flow"
                  : "Next"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
