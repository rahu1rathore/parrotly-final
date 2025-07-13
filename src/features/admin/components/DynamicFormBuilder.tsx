import React, { useState } from "react";
import { format } from "date-fns";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  TextFields as TextIcon,
  List as ListIcon,
  CheckBox as CheckboxIcon,
  CalendarToday as CalendarIcon,
  Numbers as NumberIcon,
  AttachFile as FileIcon,
  Notes as TextAreaIcon,
} from "@mui/icons-material";
import { DynamicForm, DynamicFormField } from "../types";

interface DynamicFormBuilderProps {
  forms: DynamicForm[];
  onCreateForm: (form: Partial<DynamicForm>) => void;
  onUpdateForm: (id: string, form: Partial<DynamicForm>) => void;
  onDeleteForm: (id: string) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Text", icon: <TextIcon /> },
  { value: "email", label: "Email", icon: <EmailIcon /> },
  { value: "phone", label: "Phone", icon: <PhoneIcon /> },
  { value: "number", label: "Number", icon: <NumberIcon /> },
  { value: "date", label: "Date", icon: <CalendarIcon /> },
  { value: "select", label: "Dropdown", icon: <ListIcon /> },
  { value: "textarea", label: "Text Area", icon: <TextAreaIcon /> },
  { value: "boolean", label: "Checkbox", icon: <CheckboxIcon /> },
  { value: "file", label: "File Upload", icon: <FileIcon /> },
];

export default function DynamicFormBuilder({
  forms,
  onCreateForm,
  onUpdateForm,
  onDeleteForm,
}: DynamicFormBuilderProps) {
  const [selectedForm, setSelectedForm] = useState<DynamicForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<DynamicFormField | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [fieldData, setFieldData] = useState<Partial<DynamicFormField>>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
    placeholder: "",
    validation: {},
  });

  const [fields, setFields] = useState<DynamicFormField[]>([
    {
      id: "field_phone",
      name: "phoneNumber",
      label: "Phone Number",
      type: "phone",
      required: true,
      order: 1,
      isSystem: true,
    },
  ]);

  const handleCreateNew = () => {
    setSelectedForm(null);
    setIsCreating(true);
    setFormData({ name: "", description: "" });
    setFields([
      {
        id: "field_phone",
        name: "phoneNumber",
        label: "Phone Number",
        type: "phone",
        required: true,
        order: 1,
        isSystem: true,
      },
    ]);
  };

  const handleEditForm = (form: DynamicForm) => {
    setSelectedForm(form);
    setIsCreating(true);
    setFormData({
      name: form.name,
      description: form.description || "",
    });
    setFields([...form.fields]);
  };

  const handleSaveForm = () => {
    const formPayload = {
      name: formData.name,
      description: formData.description,
      fields: fields.map((field, index) => ({
        ...field,
        order: index + 1,
      })),
      isActive: true,
    };

    if (selectedForm) {
      onUpdateForm(selectedForm.id, formPayload);
    } else {
      onCreateForm(formPayload);
    }

    setIsCreating(false);
    setSelectedForm(null);
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldData({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
      validation: {},
    });
    setFieldDialogOpen(true);
  };

  const handleEditField = (field: DynamicFormField) => {
    setEditingField(field);
    setFieldData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || [],
      placeholder: field.placeholder || "",
      validation: field.validation || {},
    });
    setFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    const newField: DynamicFormField = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldData.name!,
      label: fieldData.label!,
      type: fieldData.type!,
      required: fieldData.required!,
      options: fieldData.options,
      placeholder: fieldData.placeholder,
      validation: fieldData.validation,
      order: editingField?.order || fields.length + 1,
      isSystem: editingField?.isSystem || false,
    };

    if (editingField) {
      setFields((prev) =>
        prev.map((f) => (f.id === editingField.id ? newField : f)),
      );
    } else {
      setFields((prev) => [...prev, newField]);
    }

    setFieldDialogOpen(false);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[index],
    ];
    setFields(newFields);
  };

  const renderFieldTypeIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
    return fieldType?.icon || <TextIcon />;
  };

  const renderFormPreview = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Form Preview: {formData.name}
          </Typography>
          {formData.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {formData.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid
                item
                xs={12}
                sm={field.type === "textarea" ? 12 : 6}
                key={field.id}
              >
                {field.type === "select" ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>{field.label}</InputLabel>
                    <Select label={field.label} disabled value="">
                      {field.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : field.type === "boolean" ? (
                  <FormControlLabel
                    control={<Switch disabled />}
                    label={field.label}
                  />
                ) : field.type === "textarea" ? (
                  <TextField
                    fullWidth
                    size="small"
                    label={field.label}
                    multiline
                    rows={3}
                    placeholder={field.placeholder}
                    disabled
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label={field.label}
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                    placeholder={field.placeholder}
                    disabled
                    InputLabelProps={
                      field.type === "date" ? { shrink: true } : undefined
                    }
                  />
                )}
                {field.required && (
                  <Typography variant="caption" color="error">
                    * Required
                  </Typography>
                )}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (isCreating) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">
            {selectedForm ? "Edit Form" : "Create New Form"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit Mode" : "Preview"}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveForm}
              disabled={!formData.name.trim() || fields.length === 0}
            >
              Save Form
            </Button>
            <Button variant="outlined" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </Box>
        </Box>

        {previewMode ? (
          renderFormPreview()
        ) : (
          <Grid container spacing={3}>
            {/* Form Configuration */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Form Configuration
                </Typography>

                <TextField
                  fullWidth
                  label="Form Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddField}
                >
                  Add Field
                </Button>
              </Paper>
            </Grid>

            {/* Field List */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Form Fields ({fields.length})
                </Typography>

                {fields.length === 0 ? (
                  <Alert severity="info">
                    No fields added yet. Add some fields to build your form.
                  </Alert>
                ) : (
                  <List>
                    {fields.map((field, index) => (
                      <Card key={field.id} sx={{ mb: 1 }}>
                        <ListItem>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mr: 2,
                            }}
                          >
                            {renderFieldTypeIcon(field.type)}
                          </Box>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="subtitle2">
                                  {field.label}
                                </Typography>
                                {field.required && (
                                  <Chip
                                    label="Required"
                                    size="small"
                                    color="error"
                                  />
                                )}
                                {field.isSystem && (
                                  <Chip
                                    label="System"
                                    size="small"
                                    color="primary"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Type: {field.type} • Name: {field.name}
                                </Typography>
                                {field.options && field.options.length > 0 && (
                                  <Typography variant="caption" display="block">
                                    Options: {field.options.join(", ")}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {!field.isSystem && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => moveField(index, "up")}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => moveField(index, "down")}
                                    disabled={index === fields.length - 1}
                                  >
                                    ↓
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditField(field)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteField(field.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </>
                              )}
                              {field.isSystem && (
                                <Chip
                                  label="Protected"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Card>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Field Dialog */}
        <Dialog
          open={fieldDialogOpen}
          onClose={() => setFieldDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingField ? "Edit Field" : "Add New Field"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field Name"
                  value={fieldData.name || ""}
                  onChange={(e) =>
                    setFieldData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  helperText="Internal field name (no spaces, camelCase)"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field Label"
                  value={fieldData.label || ""}
                  onChange={(e) =>
                    setFieldData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  helperText="Label shown to users"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={fieldData.type || "text"}
                    label="Field Type"
                    onChange={(e) =>
                      setFieldData((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                  >
                    {FIELD_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Placeholder"
                  value={fieldData.placeholder || ""}
                  onChange={(e) =>
                    setFieldData((prev) => ({
                      ...prev,
                      placeholder: e.target.value,
                    }))
                  }
                  helperText="Placeholder text for the field"
                />
              </Grid>

              {fieldData.type === "select" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Options (comma-separated)"
                    value={fieldData.options?.join(", ") || ""}
                    onChange={(e) =>
                      setFieldData((prev) => ({
                        ...prev,
                        options: e.target.value
                          .split(",")
                          .map((opt) => opt.trim())
                          .filter((opt) => opt),
                      }))
                    }
                    helperText="Enter dropdown options separated by commas"
                    multiline
                    rows={2}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={fieldData.required || false}
                      onChange={(e) =>
                        setFieldData((prev) => ({
                          ...prev,
                          required: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Required Field"
                />
              </Grid>

              {(fieldData.type === "text" || fieldData.type === "textarea") && (
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Validation Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Min Length"
                            type="number"
                            value={fieldData.validation?.minLength || ""}
                            onChange={(e) =>
                              setFieldData((prev) => ({
                                ...prev,
                                validation: {
                                  ...prev.validation,
                                  minLength:
                                    parseInt(e.target.value) || undefined,
                                },
                              }))
                            }
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Max Length"
                            type="number"
                            value={fieldData.validation?.maxLength || ""}
                            onChange={(e) =>
                              setFieldData((prev) => ({
                                ...prev,
                                validation: {
                                  ...prev.validation,
                                  maxLength:
                                    parseInt(e.target.value) || undefined,
                                },
                              }))
                            }
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveField}
              variant="contained"
              disabled={!fieldData.name?.trim() || !fieldData.label?.trim()}
            >
              {editingField ? "Update Field" : "Add Field"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Dynamic Forms ({forms.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Form
        </Button>
      </Box>

      <Grid container spacing={2}>
        {forms.map((form) => (
          <Grid item xs={12} md={6} lg={4} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {form.name}
                </Typography>
                {form.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {form.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <Chip
                    label={`${form.fields.length} fields`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={form.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={form.isActive ? "success" : "default"}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Created: {format(new Date(form.createdDate), "MMM dd, yyyy")}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditForm(form)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDeleteForm(form.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {forms.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No forms created yet. Create your first dynamic form to start
              capturing leads.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
