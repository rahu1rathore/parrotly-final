import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  Card,
  CardContent,
  Stack,
  Toolbar,
  Checkbox,
  Tooltip,
  LinearProgress,
  TableSortLabel,
  Collapse,
  Fab,
  Badge,
  Avatar,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  TextareaAutosize,
  Switch,
  Tab,
  Tabs,
  TabPanel,
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
  Sort as SortIcon,
  SelectAll as SelectAllIcon,
  DeleteSweep as BulkDeleteIcon,
  Edit as BulkEditIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  GridView as GridViewIcon,
  ViewList,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Message as MessageIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Block as DisabledIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  SmartButton as ButtonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
  WhatsAppTemplateButton,
} from "../types";
import { whatsappTemplateAPI } from "../services/api";

interface WhatsAppTemplateManagementEnhancedProps {
  onTemplatesChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterState {
  search: string;
  status: "all" | "approved" | "rejected" | "pending" | "disabled";
  category: string;
  language: string;
  createdAfter: string;
  createdBefore: string;
  sortBy: "name" | "status" | "created_date" | "updated_date" | "category";
  sortOrder: "asc" | "desc";
}

interface TemplateSummary {
  totalTemplates: number;
  approvedTemplates: number;
  pendingTemplates: number;
  rejectedTemplates: number;
  statusDistribution: { [key: string]: number };
  categoryDistribution: { [key: string]: number };
  languageDistribution: { [key: string]: number };
}

type ViewMode = "table" | "grid";
type TabValue = "templates" | "send" | "analytics";

interface SendTemplateData {
  templateId: string;
  recipients: string;
  variables: { [key: string]: string };
  scheduleAt: string;
}

const WhatsAppTemplateManagementEnhanced: React.FC<
  WhatsAppTemplateManagementEnhancedProps
> = ({ onTemplatesChange }) => {
  // Core state
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [summary, setSummary] = useState<TemplateSummary | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [activeTab, setActiveTab] = useState<TabValue>("templates");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    category: "",
    language: "",
    createdAfter: "",
    createdBefore: "",
    sortBy: "created_date",
    sortOrder: "desc",
  });

  // UI state
  const [filterExpanded, setFilterExpanded] = useState(false);
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
    export: false,
    send: false,
    preview: false,
  });

  // Form state
  const [editingTemplate, setEditingTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState<WhatsAppTemplateFormData>({
    name: "",
    category: "utility",
    language: "en",
    header: undefined,
    body: "",
    footer: "",
    buttons: [],
  });
  const [formErrors, setFormErrors] = useState<
    Partial<WhatsAppTemplateFormData>
  >({});

  // Send template state
  const [sendData, setSendData] = useState<SendTemplateData>({
    templateId: "",
    recipients: "",
    variables: {},
    scheduleAt: "",
  });
  const [sendLoading, setSendLoading] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewVariables, setPreviewVariables] = useState<{
    [key: string]: string;
  }>({});

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplateForMenu, setSelectedTemplateForMenu] =
    useState<WhatsAppTemplate | null>(null);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadTemplates();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  useEffect(() => {
    loadCategories();
    loadLanguages();
  }, []);

  // API functions
  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: filters.search,
        status: filters.status,
        category: filters.category,
        language: filters.language,
        created_after: filters.createdAfter,
        created_before: filters.createdBefore,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      const response = await whatsappTemplateAPI.getAll(params);

      setTemplates(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.total_pages,
        hasNext: response.pagination.has_next,
        hasPrev: response.pagination.has_prev,
      }));
      setSummary(response.summary);
    } catch (error) {
      console.error("Error loading templates:", error);
      setError("Failed to load templates. Please try again.");
      showSnackbar("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await whatsappTemplateAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await whatsappTemplateAPI.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      console.error("Error loading languages:", error);
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
      category: "",
      language: "",
      createdAfter: "",
      createdBefore: "",
      sortBy: "created_date",
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
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map((t) => t.id));
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  const handleCreateTemplate = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.body.trim()) {
        setFormErrors({ body: "Body is required" });
        return;
      }

      await whatsappTemplateAPI.create(formData);
      showSnackbar("Template created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      resetForm();
      loadTemplates();
      onTemplatesChange?.();
    } catch (error) {
      showSnackbar("Failed to create template", "error");
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Name is required" });
        return;
      }
      if (!formData.body.trim()) {
        setFormErrors({ body: "Body is required" });
        return;
      }

      await whatsappTemplateAPI.update(editingTemplate.id, formData);
      showSnackbar("Template updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
      onTemplatesChange?.();
    } catch (error) {
      showSnackbar("Failed to update template", "error");
    }
  };

  const handleDeleteTemplate = async (template: WhatsAppTemplate) => {
    try {
      await whatsappTemplateAPI.delete(template.id);
      showSnackbar("Template deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadTemplates();
      onTemplatesChange?.();
    } catch (error) {
      showSnackbar("Failed to delete template", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await whatsappTemplateAPI.bulkDelete(selectedTemplates);
      showSnackbar(
        `${selectedTemplates.length} templates deleted successfully`,
        "success",
      );
      setSelectedTemplates([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadTemplates();
      onTemplatesChange?.();
    } catch (error) {
      showSnackbar("Failed to delete templates", "error");
    }
  };

  const handleBulkStatusUpdate = async (status: WhatsAppTemplate["status"]) => {
    try {
      await whatsappTemplateAPI.bulkUpdateStatus(selectedTemplates, status);
      showSnackbar(
        `${selectedTemplates.length} templates updated to ${status}`,
        "success",
      );
      setSelectedTemplates([]);
      loadTemplates();
      onTemplatesChange?.();
    } catch (error) {
      showSnackbar("Failed to update template status", "error");
    }
  };

  const handleSendTemplate = async () => {
    try {
      setSendLoading(true);
      const recipients = sendData.recipients
        .split("\n")
        .filter((r) => r.trim())
        .map((phone) => ({
          phone_number: phone.trim(),
          variables: sendData.variables,
        }));

      const response = await whatsappTemplateAPI.sendTemplate({
        template_id: sendData.templateId,
        recipients,
        variables: sendData.variables,
      });

      showSnackbar(
        `Template sent successfully! Delivered to ${response.sent_count} recipients.`,
        "success",
      );
      setDialogs((prev) => ({ ...prev, send: false }));
      setSendData({
        templateId: "",
        recipients: "",
        variables: {},
        scheduleAt: "",
      });
    } catch (error) {
      showSnackbar("Failed to send template", "error");
    } finally {
      setSendLoading(false);
    }
  };

  const handlePreviewTemplate = async (
    templateId: string,
    variables: { [key: string]: string },
  ) => {
    try {
      const response = await whatsappTemplateAPI.previewTemplate({
        template_id: templateId,
        variables,
      });
      setPreviewData(response);
      setDialogs((prev) => ({ ...prev, preview: true }));
    } catch (error) {
      showSnackbar("Failed to generate preview", "error");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "json") => {
    try {
      setExporting(true);
      const response = await whatsappTemplateAPI.export(format, filters);
      showSnackbar(`Export started. Download will begin shortly.`, "info");

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = `whatsapp-templates-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

      setDialogs((prev) => ({ ...prev, export: false }));
    } catch (error) {
      showSnackbar("Failed to export templates", "error");
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "utility",
      language: "en",
      header: undefined,
      body: "",
      footer: "",
      buttons: [],
    });
    setFormErrors({});
  };

  const openEditDialog = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      language: template.language,
      header: template.header,
      body: template.body,
      footer: template.footer || "",
      buttons: template.buttons || [],
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const openViewDialog = (template: WhatsAppTemplate) => {
    setViewingTemplate(template);
    setDialogs((prev) => ({ ...prev, view: true }));
  };

  const openSendDialog = (template: WhatsAppTemplate) => {
    setSendData((prev) => ({ ...prev, templateId: template.id }));
    setDialogs((prev) => ({ ...prev, send: true }));
  };

  const getStatusIcon = (status: WhatsAppTemplate["status"]) => {
    switch (status) {
      case "approved":
        return <ApprovedIcon />;
      case "pending":
        return <PendingIcon />;
      case "rejected":
        return <RejectedIcon />;
      case "disabled":
        return <DisabledIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: WhatsAppTemplate["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      case "disabled":
        return "default";
      default:
        return "default";
    }
  };

  const getHeaderIcon = (headerType?: string) => {
    switch (headerType) {
      case "image":
        return <ImageIcon />;
      case "video":
        return <VideoIcon />;
      case "document":
        return <DocumentIcon />;
      default:
        return <MessageIcon />;
    }
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Templates", status: "all" as const, color: "default" },
    { label: "Approved", status: "approved" as const, color: "success" },
    { label: "Pending", status: "pending" as const, color: "warning" },
    { label: "Rejected", status: "rejected" as const, color: "error" },
  ];

  const addButton = () => {
    const newButton: WhatsAppTemplateButton = {
      id: `btn_${Date.now()}`,
      type: "quick_reply",
      text: "",
      payload: "",
    };
    setFormData((prev) => ({
      ...prev,
      buttons: [...(prev.buttons || []), newButton],
    }));
  };

  const updateButton = (
    index: number,
    updates: Partial<WhatsAppTemplateButton>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      buttons:
        prev.buttons?.map((btn, i) =>
          i === index ? { ...btn, ...updates } : btn,
        ) || [],
    }));
  };

  const removeButton = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons?.filter((_, i) => i !== index) || [],
    }));
  };

  const CustomTabPanel = (props: {
    children?: React.ReactNode;
    index: number;
    value: number;
  }) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`template-tabpanel-${index}`}
        aria-labelledby={`template-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <WhatsAppIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.totalTemplates ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Templates
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <ApprovedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.approvedTemplates ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary?.pendingTemplates ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Review
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.categoryDistribution
                        ? Object.keys(summary.categoryDistribution).length
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categories
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content with Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {/* Tab Navigation */}
        <Tabs
          value={activeTab === "templates" ? 0 : activeTab === "send" ? 1 : 2}
          onChange={(_, newValue) => {
            const tabs: TabValue[] = ["templates", "send", "analytics"];
            setActiveTab(tabs[newValue]);
          }}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <WhatsAppIcon />
                <span>Templates</span>
                <Badge
                  badgeContent={summary?.totalTemplates ?? 0}
                  color="primary"
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <SendIcon />
                <span>Send Messages</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <AnalyticsIcon />
                <span>Analytics</span>
              </Stack>
            }
          />
        </Tabs>

        {/* Templates Tab */}
        <CustomTabPanel value={0} index={0}>
          {/* Toolbar */}
          <Toolbar sx={{ px: 0, py: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              WhatsApp Templates
              {summary && (
                <Chip
                  label={`${summary?.totalTemplates ?? 0} templates`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="table">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetForm();
                  setDialogs((prev) => ({ ...prev, create: true }));
                }}
              >
                Create Template
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTemplates}
                disabled={loading}
              >
                Refresh
              </Button>

              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() =>
                  setDialogs((prev) => ({ ...prev, export: true }))
                }
                disabled={templates.length === 0}
              >
                Export
              </Button>

              {selectedTemplates.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BulkDeleteIcon />}
                    onClick={() =>
                      setDialogs((prev) => ({ ...prev, bulkDelete: true }))
                    }
                  >
                    Delete ({selectedTemplates.length})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ApprovedIcon />}
                    onClick={() => handleBulkStatusUpdate("approved")}
                  >
                    Approve
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>

          {/* Quick Status Filters */}
          <Box sx={{ pb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Filter by Status:
              </Typography>
              {quickFilters.map((filter) => (
                <Chip
                  key={filter.status}
                  label={filter.label}
                  clickable
                  color={
                    filters.status === filter.status ? "primary" : "default"
                  }
                  variant={
                    filters.status === filter.status ? "filled" : "outlined"
                  }
                  onClick={() => handleFilterChange("status", filter.status)}
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          {/* Advanced Filters */}
          <Accordion
            expanded={filterExpanded}
            onChange={() => setFilterExpanded(!filterExpanded)}
            sx={{ boxShadow: "none", "&:before": { display: "none" } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterListIcon />
                <Typography>Advanced Filters</Typography>
                {(filters.search ||
                  filters.category ||
                  filters.language ||
                  filters.createdAfter ||
                  filters.createdBefore) && (
                  <Chip label="Active" size="small" color="primary" />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search templates..."
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
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={filters.language}
                      onChange={(e) =>
                        handleFilterChange("language", e.target.value)
                      }
                      label="Language"
                    >
                      <MenuItem value="">All Languages</MenuItem>
                      {languages.map((language) => (
                        <MenuItem key={language} value={language}>
                          {language.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      label="Sort By"
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                      <MenuItem value="category">Category</MenuItem>
                      <MenuItem value="created_date">Created Date</MenuItem>
                      <MenuItem value="updated_date">Updated Date</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        handleFilterChange("sortOrder", e.target.value)
                      }
                      label="Order"
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Loading Progress */}
          {loading && <LinearProgress />}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          templates.length > 0 &&
                          selectedTemplates.length === templates.length
                        }
                        indeterminate={
                          selectedTemplates.length > 0 &&
                          selectedTemplates.length < templates.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === "name"}
                        direction={filters.sortOrder}
                        onClick={() => handleSort("name")}
                      >
                        Template Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === "status"}
                        direction={filters.sortOrder}
                        onClick={() => handleSort("status")}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === "category"}
                        direction={filters.sortOrder}
                        onClick={() => handleSort("category")}
                      >
                        Category
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Components</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === "created_date"}
                        direction={filters.sortOrder}
                        onClick={() => handleSort("created_date")}
                      >
                        Created
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow
                      key={template.id}
                      selected={selectedTemplates.includes(template.id)}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onChange={() => handleSelectTemplate(template.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getHeaderIcon(template.header?.type)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {template.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {template.body.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(template.status)}
                          label={template.status}
                          size="small"
                          color={getStatusColor(template.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {template.language.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {template.header && (
                            <Chip
                              label="Header"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {template.footer && (
                            <Chip
                              label="Footer"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {template.buttons && template.buttons.length > 0 && (
                            <Chip
                              label={`${template.buttons.length} Buttons`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            new Date(template.createdDate),
                            "MMM dd, yyyy",
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="View Template">
                            <IconButton
                              size="small"
                              onClick={() => openViewDialog(template)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Template">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(template)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Template">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openSendDialog(template)}
                              disabled={template.status !== "approved"}
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const sampleVars: { [key: string]: string } =
                                  {};
                                template.variables?.forEach((variable) => {
                                  sampleVars[variable] = `Sample ${variable}`;
                                });
                                setPreviewVariables(sampleVars);
                                handlePreviewTemplate(template.id, sampleVars);
                              }}
                            >
                              <PreviewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Template">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setViewingTemplate(template);
                                setDialogs((prev) => ({
                                  ...prev,
                                  delete: true,
                                }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {templates.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No templates found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

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
          />
        </CustomTabPanel>

        {/* Send Messages Tab */}
        <CustomTabPanel value={1} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Send WhatsApp Template
                  </Typography>

                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Select Template</InputLabel>
                      <Select
                        value={sendData.templateId}
                        onChange={(e) =>
                          setSendData((prev) => ({
                            ...prev,
                            templateId: e.target.value,
                          }))
                        }
                        label="Select Template"
                      >
                        {templates
                          .filter((t) => t.status === "approved")
                          .map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                              {template.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Recipients (Phone Numbers)"
                      multiline
                      rows={4}
                      fullWidth
                      value={sendData.recipients}
                      onChange={(e) =>
                        setSendData((prev) => ({
                          ...prev,
                          recipients: e.target.value,
                        }))
                      }
                      placeholder="+1234567890&#10;+0987654321&#10;..."
                      helperText="Enter one phone number per line"
                    />

                    <Typography variant="subtitle2">
                      Template Variables
                    </Typography>
                    {sendData.templateId && (
                      <Box>
                        {templates
                          .find((t) => t.id === sendData.templateId)
                          ?.variables?.map((variable) => (
                            <TextField
                              key={variable}
                              label={variable}
                              fullWidth
                              value={sendData.variables[variable] || ""}
                              onChange={(e) =>
                                setSendData((prev) => ({
                                  ...prev,
                                  variables: {
                                    ...prev.variables,
                                    [variable]: e.target.value,
                                  },
                                }))
                              }
                              sx={{ mb: 2 }}
                            />
                          ))}
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={handleSendTemplate}
                      disabled={
                        !sendData.templateId ||
                        !sendData.recipients.trim() ||
                        sendLoading
                      }
                      fullWidth
                    >
                      {sendLoading ? "Sending..." : "Send Template"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Template Preview
                  </Typography>

                  {sendData.templateId ? (
                    <Box>
                      {(() => {
                        const template = templates.find(
                          (t) => t.id === sendData.templateId,
                        );
                        if (!template) return null;

                        // Replace variables in preview
                        const replaceVars = (text: string) => {
                          let result = text;
                          Object.entries(sendData.variables).forEach(
                            ([key, value]) => {
                              result = result.replace(
                                new RegExp(`{{${key}}}`, "g"),
                                value || `{{${key}}}`,
                              );
                            },
                          );
                          return result;
                        };

                        return (
                          <Box
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 2,
                              p: 2,
                              bgcolor: "#e3f2fd",
                              maxWidth: 300,
                            }}
                          >
                            {template.header && (
                              <Box
                                sx={{
                                  mb: 1,
                                  fontWeight: "bold",
                                  color: "primary.main",
                                }}
                              >
                                {replaceVars(template.header.content || "")}
                              </Box>
                            )}
                            <Box sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
                              {replaceVars(template.body)}
                            </Box>
                            {template.footer && (
                              <Box
                                sx={{
                                  mb: 1,
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                }}
                              >
                                {replaceVars(template.footer)}
                              </Box>
                            )}
                            {template.buttons &&
                              template.buttons.length > 0 && (
                                <Stack spacing={1} sx={{ mt: 2 }}>
                                  {template.buttons.map((button, index) => (
                                    <Button
                                      key={index}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      disabled
                                    >
                                      {button.text}
                                    </Button>
                                  ))}
                                </Stack>
                              )}
                          </Box>
                        );
                      })()}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Select a template to see preview
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Analytics Tab */}
        <CustomTabPanel value={2} index={2}>
          <Typography variant="h6" gutterBottom>
            Template Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics dashboard will be implemented here showing template
            performance, delivery rates, and engagement metrics.
          </Typography>
        </CustomTabPanel>
      </Paper>

      {/* Create Dialog */}
      <Dialog
        open={dialogs.create}
        onClose={() => setDialogs((prev) => ({ ...prev, create: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create WhatsApp Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Template Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  label="Category"
                >
                  <MenuItem value="utility">Utility</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="authentication">Authentication</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message Body"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, body: e.target.value }))
                }
                error={!!formErrors.body}
                helperText={
                  formErrors.body || "Use {{variable}} for dynamic content"
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Footer (Optional)"
                fullWidth
                variant="outlined"
                value={formData.footer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, footer: e.target.value }))
                }
              />
            </Grid>

            {/* Buttons Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Buttons (Optional)
              </Typography>
              {formData.buttons?.map((button, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 1, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={button.type}
                          onChange={(e) =>
                            updateButton(index, { type: e.target.value as any })
                          }
                          label="Type"
                        >
                          <MenuItem value="quick_reply">Quick Reply</MenuItem>
                          <MenuItem value="call_to_action">
                            Call to Action
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Button Text"
                        fullWidth
                        size="small"
                        value={button.text}
                        onChange={(e) =>
                          updateButton(index, { text: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={
                          button.type === "call_to_action" ? "URL" : "Payload"
                        }
                        fullWidth
                        size="small"
                        value={
                          button.type === "call_to_action"
                            ? button.url || ""
                            : button.payload || ""
                        }
                        onChange={(e) =>
                          updateButton(
                            index,
                            button.type === "call_to_action"
                              ? { url: e.target.value }
                              : { payload: e.target.value },
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeButton(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button
                startIcon={<ButtonIcon />}
                onClick={addButton}
                variant="outlined"
                size="small"
                disabled={(formData.buttons?.length || 0) >= 3}
              >
                Add Button
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} variant="contained">
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other dialogs similar to previous components... */}

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

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={() => {
          resetForm();
          setDialogs((prev) => ({ ...prev, create: true }));
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default WhatsAppTemplateManagementEnhanced;
