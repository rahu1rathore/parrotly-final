import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Chip,
  IconButton,
  Divider,
  Alert,
  Card,
  CardContent,
  FormHelperText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  WhatsAppTemplateFormData,
  WhatsAppTemplateButton,
  WhatsAppTemplateHeader,
} from "../types";

interface TemplateCreationFormProps {
  initialData?: WhatsAppTemplateFormData;
  onSubmit: (data: WhatsAppTemplateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORIES = [
  { value: "marketing", label: "Marketing" },
  { value: "utility", label: "Utility" },
  { value: "authentication", label: "Authentication" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
];

const HEADER_TYPES = [
  { value: "text", label: "Text", icon: <span>📝</span> },
  { value: "image", label: "Image", icon: <ImageIcon /> },
  { value: "video", label: "Video", icon: <VideoIcon /> },
  { value: "document", label: "Document", icon: <DocumentIcon /> },
];

const BUTTON_TYPES = [
  { value: "call_to_action", label: "Call to Action" },
  { value: "quick_reply", label: "Quick Reply" },
];

export default function TemplateCreationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: TemplateCreationFormProps) {
  const [formData, setFormData] = useState<WhatsAppTemplateFormData>({
    name: "",
    category: "utility",
    language: "en",
    body: "",
    buttons: [],
    ...initialData,
  });

  const [hasHeader, setHasHeader] = useState(!!initialData?.header);
  const [hasFooter, setHasFooter] = useState(!!initialData?.footer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);

  // Extract variables from template content
  useEffect(() => {
    const extractVariables = () => {
      const variables = new Set<string>();
      const regex = /\{\{([^}]+)\}\}/g;

      const contents = [
        formData.body,
        formData.header?.content,
        formData.footer,
      ].filter(Boolean);

      contents.forEach((content) => {
        if (content) {
          let match;
          while ((match = regex.exec(content)) !== null) {
            variables.add(match[1].trim());
          }
        }
      });

      setExtractedVariables(Array.from(variables));
    };

    extractVariables();
  }, [formData.body, formData.header?.content, formData.footer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Template body is required";
    }

    if (hasHeader && formData.header) {
      if (!formData.header.content.trim()) {
        newErrors.headerContent = "Header content is required";
      }
      if (
        formData.header.type !== "text" &&
        !formData.header.mediaUrl?.trim()
      ) {
        newErrors.headerMediaUrl = "Media URL is required for this header type";
      }
    }

    // Validate buttons
    formData.buttons.forEach((button, index) => {
      if (!button.text.trim()) {
        newErrors[`button_${index}_text`] = "Button text is required";
      }
      if (
        button.type === "call_to_action" &&
        !button.url &&
        !button.phoneNumber
      ) {
        newErrors[`button_${index}_action`] =
          "URL or phone number is required for call-to-action buttons";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (!hasHeader) submitData.header = undefined;
      if (!hasFooter) submitData.footer = undefined;
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleHeaderChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value } as WhatsAppTemplateHeader,
    }));
  };

  const addButton = () => {
    const newButton: WhatsAppTemplateButton = {
      id: `btn_${Date.now()}`,
      type: "quick_reply",
      text: "",
      payload: "",
    };
    setFormData((prev) => ({
      ...prev,
      buttons: [...prev.buttons, newButton],
    }));
  };

  const updateButton = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button,
      ),
    }));
  };

  const removeButton = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };

  const renderPreview = () => {
    return (
      <Card sx={{ maxWidth: 350, mx: "auto", backgroundColor: "#f0f0f0" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              backgroundColor: "#075e54",
              color: "white",
              p: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="caption">WhatsApp Preview</Typography>
          </Box>

          <Box sx={{ p: 2, backgroundColor: "white", minHeight: 200 }}>
            {/* Header */}
            {hasHeader && formData.header && (
              <Box sx={{ mb: 2 }}>
                {formData.header.type === "text" ? (
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "#128c7e" }}
                  >
                    {formData.header.content || "Header text..."}
                  </Typography>
                ) : (
                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        p: 2,
                        borderRadius: 1,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 60,
                      }}
                    >
                      {formData.header.type === "image" && (
                        <ImageIcon sx={{ mr: 1 }} />
                      )}
                      {formData.header.type === "video" && (
                        <VideoIcon sx={{ mr: 1 }} />
                      )}
                      {formData.header.type === "document" && (
                        <DocumentIcon sx={{ mr: 1 }} />
                      )}
                      <Typography variant="caption">
                        {formData.header.content ||
                          `${formData.header.type} placeholder`}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Body */}
            <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {formData.body || "Template body text will appear here..."}
            </Typography>

            {/* Footer */}
            {hasFooter && formData.footer && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontStyle: "italic" }}
              >
                {formData.footer}
              </Typography>
            )}

            {/* Buttons */}
            {formData.buttons.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {formData.buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      mb: 0.5,
                      textTransform: "none",
                      borderColor: "#128c7e",
                      color: "#128c7e",
                      "&:hover": {
                        backgroundColor: "#128c7e",
                        color: "white",
                      },
                    }}
                  >
                    {button.type === "call_to_action" && (
                      <LinkIcon sx={{ mr: 1, fontSize: 16 }} />
                    )}
                    {button.type === "call_to_action" && button.phoneNumber && (
                      <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                    )}
                    {button.text || "Button text"}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Form Section */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {initialData ? "Edit Template" : "Create New Template"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={formData.language}
                    label="Language"
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  >
                    {LANGUAGES.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Header Section */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasHeader}
                      onChange={(e) => {
                        setHasHeader(e.target.checked);
                        if (!e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            header: undefined,
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            header: { type: "text", content: "" },
                          }));
                        }
                      }}
                    />
                  }
                  label="Include Header"
                />
              </Grid>

              {hasHeader && (
                <>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Header Type</InputLabel>
                      <Select
                        value={formData.header?.type || "text"}
                        label="Header Type"
                        onChange={(e) =>
                          handleHeaderChange("type", e.target.value)
                        }
                      >
                        {HEADER_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {type.icon}
                              <Typography sx={{ ml: 1 }}>
                                {type.label}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Header Content"
                      value={formData.header?.content || ""}
                      onChange={(e) =>
                        handleHeaderChange("content", e.target.value)
                      }
                      error={!!errors.headerContent}
                      helperText={errors.headerContent}
                    />
                  </Grid>

                  {formData.header?.type !== "text" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Media URL"
                        value={formData.header?.mediaUrl || ""}
                        onChange={(e) =>
                          handleHeaderChange("mediaUrl", e.target.value)
                        }
                        error={!!errors.headerMediaUrl}
                        helperText={errors.headerMediaUrl}
                        placeholder="https://example.com/image.jpg"
                      />
                    </Grid>
                  )}
                </>
              )}

              {/* Body */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Body"
                  value={formData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  error={!!errors.body}
                  helperText={
                    errors.body || "Use {{variable_name}} for dynamic content"
                  }
                  required
                />
              </Grid>

              {/* Footer */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasFooter}
                      onChange={(e) => {
                        setHasFooter(e.target.checked);
                        if (!e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            footer: undefined,
                          }));
                        }
                      }}
                    />
                  }
                  label="Include Footer"
                />
              </Grid>

              {hasFooter && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Footer Text"
                    value={formData.footer || ""}
                    onChange={(e) =>
                      handleInputChange("footer", e.target.value)
                    }
                    placeholder="Optional footer text"
                  />
                </Grid>
              )}

              {/* Variables */}
              {extractedVariables.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Variables Found:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {extractedVariables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{{${variable}}}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle2">
                    Buttons ({formData.buttons.length}/3)
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addButton}
                    disabled={formData.buttons.length >= 3}
                    sx={{ ml: 2 }}
                  >
                    Add Button
                  </Button>
                </Box>

                {formData.buttons.map((button, index) => (
                  <Card key={button.id} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={button.type}
                            label="Type"
                            onChange={(e) =>
                              updateButton(index, "type", e.target.value)
                            }
                          >
                            {BUTTON_TYPES.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Button Text"
                          value={button.text}
                          onChange={(e) =>
                            updateButton(index, "text", e.target.value)
                          }
                          error={!!errors[`button_${index}_text`]}
                          helperText={errors[`button_${index}_text`]}
                        />
                      </Grid>

                      {button.type === "call_to_action" && (
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="URL or Phone"
                            value={button.url || button.phoneNumber || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (
                                value.startsWith("+") ||
                                value.startsWith("tel:")
                              ) {
                                updateButton(index, "phoneNumber", value);
                                updateButton(index, "url", "");
                              } else {
                                updateButton(index, "url", value);
                                updateButton(index, "phoneNumber", "");
                              }
                            }}
                            error={!!errors[`button_${index}_action`]}
                            helperText={errors[`button_${index}_action`]}
                            placeholder="https://... or +1234567890"
                          />
                        </Grid>
                      )}

                      {button.type === "quick_reply" && (
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Payload"
                            value={button.payload || ""}
                            onChange={(e) =>
                              updateButton(index, "payload", e.target.value)
                            }
                            placeholder="BUTTON_CLICKED"
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeButton(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Template"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Preview Section */}
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <PreviewIcon sx={{ mr: 1 }} />
            Live Preview
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {renderPreview()}

          {extractedVariables.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                This template contains {extractedVariables.length} variable(s).
                Values will be replaced when sending.
              </Typography>
            </Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
