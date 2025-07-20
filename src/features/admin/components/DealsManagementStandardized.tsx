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
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

interface Deal {
  id: string;
  name: string;
  customer: {
    id: string;
    name: string;
    avatar: string;
  };
  value: number;
  stage: "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  closingDate: string;
  assignedTo?: string;
  assignedToName?: string;
  createdDate: string;
  updatedDate?: string;
  notes?: string;
}

interface DealFormData {
  name: string;
  customerId: string;
  value: number;
  stage: Deal["stage"];
  probability: number;
  closingDate: string;
  assignedTo: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  avatar: string;
}

interface Agent {
  id: string;
  name: string;
}

interface DealsManagementStandardizedProps {
  onDealsChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  stage: "all" | Deal["stage"];
  assignedTo: string;
  sortBy: "name" | "value" | "closing_date" | "created_date";
  sortOrder: "asc" | "desc";
}

const STAGE_COLORS = {
  discovery: "#3b82f6",
  proposal: "#8b5cf6",
  negotiation: "#f59e0b",
  closed_won: "#10b981",
  closed_lost: "#ef4444",
} as const;

const DealsManagementStandardized: React.FC<DealsManagementStandardizedProps> = ({
  onDealsChange,
}) => {
  // Core state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    stage: "all",
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
  });

  // Form state
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState<DealFormData>({
    name: "",
    customerId: "",
    value: 0,
    stage: "discovery",
    probability: 0,
    closingDate: new Date().toISOString().split("T")[0],
    assignedTo: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<DealFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDealForMenu, setSelectedDealForMenu] = useState<Deal | null>(null);

  // Mock data
  const mockDeals: Deal[] = [
    {
      id: "1",
      name: "Enterprise Software Package",
      customer: { id: "1", name: "Acme Corp", avatar: "A" },
      value: 125000,
      stage: "proposal",
      probability: 75,
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: "agent1",
      assignedToName: "John Sales",
      createdDate: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Cloud Migration Service",
      customer: { id: "2", name: "TechSolutions Inc", avatar: "T" },
      value: 87500,
      stage: "negotiation",
      probability: 90,
      closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: "agent2",
      assignedToName: "Jane Closer",
      createdDate: new Date().toISOString(),
    },
  ];

  const mockCustomers: Customer[] = [
    { id: "1", name: "Acme Corp", avatar: "A" },
    { id: "2", name: "TechSolutions Inc", avatar: "T" },
    { id: "3", name: "Global Media", avatar: "G" },
  ];

  const mockAgents: Agent[] = [
    { id: "agent1", name: "John Sales" },
    { id: "agent2", name: "Jane Closer" },
  ];

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadDeals();
    loadCustomers();
    loadAgents();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // API functions
  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockDeals];

      if (filters.search) {
        filteredData = filteredData.filter((deal) => {
          const searchTerm = filters.search.toLowerCase();
          return (
            deal.name.toLowerCase().includes(searchTerm) ||
            deal.customer.name.toLowerCase().includes(searchTerm) ||
            deal.assignedToName?.toLowerCase().includes(searchTerm)
          );
        });
      }

      if (filters.stage !== "all") {
        filteredData = filteredData.filter((deal) => deal.stage === filters.stage);
      }

      if (filters.assignedTo) {
        filteredData = filteredData.filter((deal) => deal.assignedTo === filters.assignedTo);
      }

      setDeals(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading deals:", error);
      setError("Failed to load deals. Please try again.");
      showSnackbar("Failed to load deals", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setCustomers(mockCustomers);
    } catch (error) {
      showSnackbar("Failed to load customers", "error");
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
      stage: "all",
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
    if (selectedDeals.length === deals.length) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(deals.map((d) => d.id));
    }
  };

  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals((prev) =>
      prev.includes(dealId)
        ? prev.filter((id) => id !== dealId)
        : [...prev, dealId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, deal: Deal) => {
    setAnchorEl(event.currentTarget);
    setSelectedDealForMenu(deal);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedDealForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedDealForMenu) {
      setViewingDeal(selectedDealForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedDealForMenu) {
      openEditDialog(selectedDealForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedDealForMenu) {
      setViewingDeal(selectedDealForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateDeal = async () => {
    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Deal name is required" });
        return;
      }

      const customer = customers.find(c => c.id === formData.customerId);
      const agent = agents.find(a => a.id === formData.assignedTo);
      
      const newDeal: Deal = {
        id: Date.now().toString(),
        name: formData.name,
        customer: customer || { id: "", name: "", avatar: "" },
        value: formData.value,
        stage: formData.stage,
        probability: formData.probability,
        closingDate: formData.closingDate,
        assignedTo: formData.assignedTo,
        assignedToName: agent?.name,
        createdDate: new Date().toISOString(),
      };

      showSnackbar("Deal created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({
        name: "",
        customerId: "",
        value: 0,
        stage: "discovery",
        probability: 0,
        closingDate: new Date().toISOString().split("T")[0],
        assignedTo: "",
      });
      loadDeals();
      onDealsChange?.();
    } catch (error) {
      showSnackbar("Failed to create deal", "error");
    }
  };

  const handleUpdateDeal = async () => {
    if (!editingDeal) return;

    try {
      setFormErrors({});
      if (!formData.name.trim()) {
        setFormErrors({ name: "Deal name is required" });
        return;
      }

      showSnackbar("Deal updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingDeal(null);
      setFormData({
        name: "",
        customerId: "",
        value: 0,
        stage: "discovery",
        probability: 0,
        closingDate: new Date().toISOString().split("T")[0],
        assignedTo: "",
      });
      loadDeals();
      onDealsChange?.();
    } catch (error) {
      showSnackbar("Failed to update deal", "error");
    }
  };

  const handleDeleteDeal = async (deal: Deal) => {
    try {
      showSnackbar("Deal deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadDeals();
      onDealsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete deal", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      showSnackbar(
        `${selectedDeals.length} deals deleted successfully`,
        "success",
      );
      setSelectedDeals([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadDeals();
      onDealsChange?.();
    } catch (error) {
      showSnackbar("Failed to delete deals", "error");
    }
  };

  const openEditDialog = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      customerId: deal.customer.id,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      closingDate: deal.closingDate.split("T")[0],
      assignedTo: deal.assignedTo || "",
      notes: deal.notes,
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getStageColor = (stage: string) => {
    return STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || "#6b7280";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Deals", stage: "all" as const },
    { label: "Discovery", stage: "discovery" as const },
    { label: "Proposal", stage: "proposal" as const },
    { label: "Negotiation", stage: "negotiation" as const },
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
                        key={filter.stage}
                        onClick={() => handleFilterChange("stage", filter.stage)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          filters.stage === filter.stage
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
                    placeholder="Search deals..."
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

                {/* Assigned To Filter */}
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                    label="Assigned To"
                    className="bg-white"
                  >
                    <MenuItem value="">All</MenuItem>
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))}
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
                    setFormData({
                      name: "",
                      customerId: "",
                      value: 0,
                      stage: "discovery",
                      probability: 0,
                      closingDate: new Date().toISOString().split("T")[0],
                      assignedTo: "",
                    });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Deal
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadDeals}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={deals.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedDeals.length > 0 && (
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
                    Delete ({selectedDeals.length})
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
                        deals.length > 0 &&
                        selectedDeals.length === deals.length
                      }
                      indeterminate={
                        selectedDeals.length > 0 &&
                        selectedDeals.length < deals.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "name"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("name")}
                      className="font-semibold text-gray-700"
                    >
                      Deal Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Customer</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "value"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("value")}
                      className="font-semibold text-gray-700"
                    >
                      Value
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Stage</TableCell>
                  <TableCell className="font-semibold text-gray-700">Probability</TableCell>
                  <TableCell className="font-semibold text-gray-700">Assigned To</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "closing_date"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("closing_date")}
                      className="font-semibold text-gray-700"
                    >
                      Closing Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow
                    key={deal.id}
                    selected={selectedDeals.includes(deal.id)}
                    hover
                    className="hover:bg-gray-50"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDeals.includes(deal.id)}
                        onChange={() => handleSelectDeal(deal.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          <TrendingUpIcon style={{ fontSize: '16px' }} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{deal.name}</div>
                          <div className="text-sm text-gray-500">Deal ID: {deal.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: '12px' }}
                          style={{ backgroundColor: "#3b82f6" }}
                        >
                          {deal.customer.avatar}
                        </Avatar>
                        <span className="text-sm text-gray-700">{deal.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MoneyIcon style={{ fontSize: '16px' }} className="text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1).replace('_', ' ')}
                        size="small"
                        style={{
                          backgroundColor: getStageColor(deal.stage) + "20",
                          color: getStageColor(deal.stage),
                          border: `1px solid ${getStageColor(deal.stage)}40`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{deal.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: '12px' }}
                            style={{ backgroundColor: "#3b82f6" }}
                          >
                            {deal.assignedToName.charAt(0)}
                          </Avatar>
                          <span className="text-sm text-gray-700">{deal.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <EventIcon style={{ fontSize: '16px' }} className="text-gray-400" />
                        <Typography variant="body2" className="text-gray-600">
                          {format(new Date(deal.closingDate), "MMM dd, yyyy")}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, deal)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {deals.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" className="py-12">
                      <div className="text-center">
                        <TrendingUpIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No deals found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first deal
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
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Deal Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              className="mb-4"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customerId}
                    label="Customer"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customerId: e.target.value }))
                    }
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Value"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: Number(e.target.value) }))
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={formData.stage}
                    label="Stage"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stage: e.target.value as any }))
                    }
                  >
                    <MenuItem value="discovery">Discovery</MenuItem>
                    <MenuItem value="proposal">Proposal</MenuItem>
                    <MenuItem value="negotiation">Negotiation</MenuItem>
                    <MenuItem value="closed_won">Closed Won</MenuItem>
                    <MenuItem value="closed_lost">Closed Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Probability (%)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, probability: Number(e.target.value) }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Closing Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.closingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, closingDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={formData.assignedTo}
                    label="Assign To"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))
                    }
                  >
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDeal} variant="contained">
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
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Deal Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              className="mb-4"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customerId}
                    label="Customer"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customerId: e.target.value }))
                    }
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Value"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: Number(e.target.value) }))
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={formData.stage}
                    label="Stage"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stage: e.target.value as any }))
                    }
                  >
                    <MenuItem value="discovery">Discovery</MenuItem>
                    <MenuItem value="proposal">Proposal</MenuItem>
                    <MenuItem value="negotiation">Negotiation</MenuItem>
                    <MenuItem value="closed_won">Closed Won</MenuItem>
                    <MenuItem value="closed_lost">Closed Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Probability (%)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, probability: Number(e.target.value) }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Closing Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.closingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, closingDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={formData.assignedTo}
                    label="Assign To"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))
                    }
                  >
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDeal} variant="contained">
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
          <DialogTitle>Deal Details</DialogTitle>
          <DialogContent>
            {viewingDeal && (
              <Stack spacing={3}>
                <TextField
                  label="Deal Name"
                  value={viewingDeal.name}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Customer"
                  value={viewingDeal.customer.name}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Value"
                  value={formatCurrency(viewingDeal.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Stage"
                  value={viewingDeal.stage}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Probability"
                  value={`${viewingDeal.probability}%`}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Closing Date"
                  value={
                    viewingDeal.closingDate
                      ? format(new Date(viewingDeal.closingDate), "PPP")
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
            {viewingDeal && (
              <Button
                onClick={() => openEditDialog(viewingDeal)}
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
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingDeal?.name}"? This action
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
              onClick={() => viewingDeal && handleDeleteDeal(viewingDeal)}
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
          <DialogTitle>Delete Selected Deals</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedDeals.length} selected
              deals? This action cannot be undone.
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
              Delete {selectedDeals.length} Deals
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

export default DealsManagementStandardized;
