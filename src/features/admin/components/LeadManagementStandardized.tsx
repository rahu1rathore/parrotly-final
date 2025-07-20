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
  Avatar,
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
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Lead, LeadFormData, Campaign, Agent } from "../types";

interface LeadManagementStandardizedProps {
  onLeadsChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  status: "all" | "new" | "contacted" | "qualified" | "converted" | "dropped" | "nurturing";
  campaign: string;
  priority: "all" | "low" | "medium" | "high";
  assignedTo: string;
  sortBy: "phone_number" | "campaign_name" | "created_date" | "priority";
  sortOrder: "asc" | "desc";
}

const STATUS_COLORS = {
  new: "#3b82f6",
  contacted: "#f59e0b", 
  qualified: "#8b5cf6",
  converted: "#10b981",
  dropped: "#ef4444",
  nurturing: "#6b7280",
} as const;

const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
} as const;

const LeadManagementStandardized: React.FC<LeadManagementStandardizedProps> = ({
  onLeadsChange,
}) => {
  // Core state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

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
    campaign: "",
    priority: "all",
    assignedTo: "",
    sortBy: "created_date",
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
    assign: false,
  });

  // Form state
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<LeadFormData>({
    campaignId: "",
    phoneNumber: "",
    data: {},
    priority: "medium",
  });
  const [formErrors, setFormErrors] = useState<Partial<LeadFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLeadForMenu, setSelectedLeadForMenu] = useState<Lead | null>(null);

  // Mock data
  const mockLeads: Lead[] = [
    {
      id: "1",
      campaignId: "campaign1",
      campaignName: "Summer Campaign",
      phoneNumber: "+1234567890",
      data: { fullName: "John Doe", email: "john@example.com", company: "Acme Corp" },
      status: "new",
      priority: "high",
      assignedTo: "agent1",
      assignedToName: "Agent Smith",
      source: "Website",
      createdDate: new Date().toISOString(),
      notes: "Interested in premium package",
    },
    {
      id: "2", 
      campaignId: "campaign2",
      campaignName: "Winter Promo",
      phoneNumber: "+1234567891",
      data: { fullName: "Jane Smith", email: "jane@example.com", company: "Tech Inc" },
      status: "contacted",
      priority: "medium",
      assignedTo: "agent2",
      assignedToName: "Agent Jones",
      source: "Cold Call",
      createdDate: new Date().toISOString(),
      notes: "Follow up needed",
    },
  ];

  const mockCampaigns: Campaign[] = [
    { id: "campaign1", name: "Summer Campaign", formId: "form1", organizationId: "org1" },
    { id: "campaign2", name: "Winter Promo", formId: "form2", organizationId: "org1" },
  ];

  const mockAgents: Agent[] = [
    { id: "agent1", name: "Agent Smith", assignedLeadsCount: 15 },
    { id: "agent2", name: "Agent Jones", assignedLeadsCount: 12 },
  ];

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadLeads();
    loadCampaigns();
    loadAgents();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // API functions
  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockLeads];

      if (filters.search) {
        filteredData = filteredData.filter((lead) => {
          const searchTerm = filters.search.toLowerCase();
          return (
            lead.phoneNumber.toLowerCase().includes(searchTerm) ||
            lead.data.fullName?.toLowerCase().includes(searchTerm) ||
            lead.data.email?.toLowerCase().includes(searchTerm) ||
            lead.campaignName?.toLowerCase().includes(searchTerm)
          );
        });
      }

      if (filters.status !== "all") {
        filteredData = filteredData.filter((lead) => lead.status === filters.status);
      }

      if (filters.campaign) {
        filteredData = filteredData.filter((lead) => lead.campaignId === filters.campaign);
      }

      if (filters.priority !== "all") {
        filteredData = filteredData.filter((lead) => lead.priority === filters.priority);
      }

      if (filters.assignedTo) {
        filteredData = filteredData.filter((lead) => lead.assignedTo === filters.assignedTo);
      }

      setLeads(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading leads:", error);
      setError("Failed to load leads. Please try again.");
      showSnackbar("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      setCampaigns(mockCampaigns);
    } catch (error) {
      showSnackbar("Failed to load campaigns", "error");
    }
  };

  const loadAgents = async () => {
    try {
      setAgents(mockAgents);
    } catch (error) {
      showSnackbar("Failed to load agents", "error");
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
      campaign: "",
      priority: "all",
      assignedTo: "",
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
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeadForMenu(lead);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedLeadForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedLeadForMenu) {
      setViewingLead(selectedLeadForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedLeadForMenu) {
      openEditDialog(selectedLeadForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedLeadForMenu) {
      setViewingLead(selectedLeadForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  const handleAssignAction = () => {
    if (selectedLeadForMenu) {
      setViewingLead(selectedLeadForMenu);
      setDialogs((prev) => ({ ...prev, assign: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateLead = async () => {
    try {
      setFormErrors({});
      if (!formData.phoneNumber.trim()) {
        setFormErrors({ phoneNumber: "Phone number is required" });
        return;
      }

      const newLead: Lead = {
        id: Date.now().toString(),
        campaignId: formData.campaignId,
        campaignName: campaigns.find(c => c.id === formData.campaignId)?.name || "",
        phoneNumber: formData.phoneNumber,
        data: formData.data,
        status: "new",
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        assignedToName: agents.find(a => a.id === formData.assignedTo)?.name,
        source: "Manual Entry",
        createdDate: new Date().toISOString(),
        notes: formData.notes,
      };

      showSnackbar("Lead created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({ campaignId: "", phoneNumber: "", data: {}, priority: "medium" });
      loadLeads();
      onLeadsChange?.();
    } catch (error) {
      showSnackbar("Failed to create lead", "error");
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;

    try {
      setFormErrors({});
      if (!formData.phoneNumber.trim()) {
        setFormErrors({ phoneNumber: "Phone number is required" });
        return;
      }

      showSnackbar("Lead updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingLead(null);
      setFormData({ campaignId: "", phoneNumber: "", data: {}, priority: "medium" });
      loadLeads();
      onLeadsChange?.();
    } catch (error) {
      showSnackbar("Failed to update lead", "error");
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    try {
      showSnackbar("Lead deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadLeads();
      onLeadsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete lead", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      showSnackbar(
        `${selectedLeads.length} leads deleted successfully`,
        "success",
      );
      setSelectedLeads([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadLeads();
      onLeadsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete leads", "error");
    }
  };

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      campaignId: lead.campaignId,
      phoneNumber: lead.phoneNumber,
      data: lead.data,
      priority: lead.priority,
      assignedTo: lead.assignedTo,
      notes: lead.notes,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280";
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#6b7280";
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Leads", status: "all" as const },
    { label: "New", status: "new" as const },
    { label: "Contacted", status: "contacted" as const },
    { label: "Qualified", status: "qualified" as const },
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
                    placeholder="Search leads..."
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

                {/* Campaign Filter */}
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Campaign</InputLabel>
                  <Select
                    value={filters.campaign}
                    onChange={(e) => handleFilterChange("campaign", e.target.value)}
                    label="Campaign"
                    className="bg-white"
                  >
                    <MenuItem value="">All</MenuItem>
                    {campaigns.map((campaign) => (
                      <MenuItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Priority Filter */}
                <FormControl size="small" className="min-w-[100px]">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    label="Priority"
                    className="bg-white"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
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
                    setFormData({ campaignId: "", phoneNumber: "", data: {}, priority: "medium" });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Lead
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadLeads}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={leads.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedLeads.length > 0 && (
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
                    Delete ({selectedLeads.length})
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
                        leads.length > 0 &&
                        selectedLeads.length === leads.length
                      }
                      indeterminate={
                        selectedLeads.length > 0 &&
                        selectedLeads.length < leads.length
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
                      Contact Info
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "campaign_name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("campaign_name")}
                      className="font-semibold text-gray-700"
                    >
                      Campaign
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "priority"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("priority")}
                      className="font-semibold text-gray-700"
                    >
                      Priority
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Assigned To</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "created_date"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("created_date")}
                      className="font-semibold text-gray-700"
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    selected={selectedLeads.includes(lead.id)}
                    hover
                    className="hover:bg-gray-50"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          <PhoneIcon style={{ fontSize: '16px' }} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lead.phoneNumber}</div>
                          <div className="text-sm text-gray-500">{lead.data.fullName || "No name"}</div>
                          {lead.data.email && (
                            <div className="text-xs text-gray-400">{lead.data.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BusinessIcon style={{ fontSize: '16px' }} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {lead.campaignName || "No Campaign"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        size="small"
                        style={{
                          backgroundColor: getStatusColor(lead.status) + "20",
                          color: getStatusColor(lead.status),
                          border: `1px solid ${getStatusColor(lead.status)}40`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        size="small"
                        variant="outlined"
                        style={{
                          borderColor: getPriorityColor(lead.priority),
                          color: getPriorityColor(lead.priority),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {lead.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: '12px' }}
                            style={{ backgroundColor: "#3b82f6" }}
                          >
                            {lead.assignedToName.charAt(0)}
                          </Avatar>
                          <span className="text-sm text-gray-700">{lead.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-gray-600">
                        {lead.createdDate
                          ? format(new Date(lead.createdDate), "MMM dd, yyyy")
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, lead)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12">
                      <div className="text-center">
                        <PersonIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No leads found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first lead
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
          <MenuItem onClick={handleAssignAction} className="hover:bg-gray-50">
            <ListItemIcon>
              <AssignmentIcon fontSize="small" className="text-green-600" />
            </ListItemIcon>
            <ListItemText>Assign</ListItemText>
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
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              className="mb-4"
            />
            <FormControl fullWidth margin="dense" className="mb-4">
              <InputLabel>Campaign</InputLabel>
              <Select
                value={formData.campaignId}
                label="Campaign"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, campaignId: e.target.value }))
                }
              >
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value as any }))
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLead} variant="contained">
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
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              className="mb-4"
            />
            <FormControl fullWidth margin="dense" className="mb-4">
              <InputLabel>Campaign</InputLabel>
              <Select
                value={formData.campaignId}
                label="Campaign"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, campaignId: e.target.value }))
                }
              >
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value as any }))
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLead} variant="contained">
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
          <DialogTitle>Lead Details</DialogTitle>
          <DialogContent>
            {viewingLead && (
              <Stack spacing={3}>
                <TextField
                  label="Phone Number"
                  value={viewingLead.phoneNumber}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Campaign"
                  value={viewingLead.campaignName || "No campaign"}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  value={viewingLead.status}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Priority"
                  value={viewingLead.priority}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Created"
                  value={
                    viewingLead.createdDate
                      ? format(new Date(viewingLead.createdDate), "PPP")
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
            {viewingLead && (
              <Button
                onClick={() => openEditDialog(viewingLead)}
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
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingLead?.phoneNumber}"? This action
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
              onClick={() => viewingLead && handleDeleteLead(viewingLead)}
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
          <DialogTitle>Delete Selected Leads</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedLeads.length} selected
              leads? This action cannot be undone.
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
              Delete {selectedLeads.length} Leads
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

export default LeadManagementStandardized;
