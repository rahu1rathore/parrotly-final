import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  Campaign,
  CampaignFormData,
  DynamicForm,
  CampaignStats,
} from "../types";

interface CampaignManagementProps {
  campaigns: Campaign[];
  dynamicForms: DynamicForm[];
  campaignStats?: CampaignStats;
  loading?: boolean;
  onCreateCampaign: (data: CampaignFormData) => void;
  onUpdateCampaign: (id: string, data: CampaignFormData) => void;
  onDeleteCampaign: (id: string) => void;
  onViewCampaign: (campaign: Campaign) => void;
  onRefresh?: () => void;
}

const STATUS_COLORS = {
  draft: "default",
  active: "success",
  paused: "warning",
  completed: "primary",
  cancelled: "error",
} as const;

export default function CampaignManagement({
  campaigns,
  dynamicForms,
  campaignStats,
  loading = false,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onViewCampaign,
  onRefresh,
}: CampaignManagementProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    status: "draft",
  });

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate campaigns
  const paginatedCampaigns = filteredCampaigns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    campaign: Campaign,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleEdit = () => {
    if (selectedCampaign) {
      setEditingCampaign(selectedCampaign);
      setFormData({
        name: selectedCampaign.name,
        description: selectedCampaign.description,
        startDate: selectedCampaign.startDate.split("T")[0],
        endDate: selectedCampaign.endDate?.split("T")[0],
        status: selectedCampaign.status,
        formId: selectedCampaign.formId,
      });
      setFormDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedCampaign) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedCampaign) {
      onViewCampaign(selectedCampaign);
    }
    handleMenuClose();
  };

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      status: "draft",
    });
    setFormDialogOpen(true);
  };

  const handleFormSubmit = () => {
    if (editingCampaign) {
      onUpdateCampaign(editingCampaign.id, formData);
    } else {
      onCreateCampaign(formData);
    }
    setFormDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (selectedCampaign) {
      onDeleteCampaign(selectedCampaign.id);
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      status: "draft",
    });
    setEditingCampaign(null);
  };

  const renderStatusChip = (status: Campaign["status"]) => (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLORS[status]}
      size="small"
      variant="filled"
      icon={
        status === "active" ? (
          <PlayArrowIcon />
        ) : status === "paused" ? (
          <PauseIcon />
        ) : status === "completed" ? (
          <CheckCircleIcon />
        ) : undefined
      }
    />
  );

  const renderStatsCards = () => {
    if (!campaignStats) return null;

    const statsCards = [
      {
        title: "Total Campaigns",
        value: campaignStats.totalCampaigns,
        icon: <CampaignIcon />,
        color: "#2196f3",
      },
      {
        title: "Active Campaigns",
        value: campaignStats.activeCampaigns,
        icon: <PlayArrowIcon />,
        color: "#4caf50",
      },
      {
        title: "Total Leads",
        value: campaignStats.totalLeads.toLocaleString(),
        icon: <PeopleIcon />,
        color: "#ff9800",
      },
      {
        title: "Conversion Rate",
        value: `${campaignStats.conversionRate}%`,
        icon: <TrendingUpIcon />,
        color: "#9c27b0",
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Header and Controls */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            Campaign Management ({filteredCampaigns.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create Campaign
          </Button>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
              {onRefresh && (
                <Button variant="outlined" onClick={onRefresh}>
                  Refresh
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Campaigns Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Associated Form</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Leads</TableCell>
                <TableCell>Conversion</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Loading campaigns...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography>
                      {filteredCampaigns.length === 0 && campaigns.length > 0
                        ? "No campaigns match your search criteria"
                        : "No campaigns found. Create your first campaign to get started."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} hover>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          {campaign.name}
                        </Typography>
                        {campaign.description && (
                          <Typography variant="body2" color="text.secondary">
                            {campaign.description.length > 50
                              ? `${campaign.description.substring(0, 50)}...`
                              : campaign.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>{renderStatusChip(campaign.status)}</TableCell>

                    <TableCell>
                      {campaign.formName ? (
                        <Tooltip title={`Form ID: ${campaign.formId}`}>
                          <Chip
                            label={campaign.formName}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No form assigned
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(campaign.startDate), "MMM dd, yyyy")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {campaign.endDate ? (
                        <Typography variant="body2">
                          {format(new Date(campaign.endDate), "MMM dd, yyyy")}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No end date
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {campaign.leadCount}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          total
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {campaign.convertedCount}/{campaign.leadCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {campaign.leadCount > 0
                            ? `${((campaign.convertedCount / campaign.leadCount) * 100).toFixed(1)}%`
                            : "0%"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {campaign.owner.split("@")[0]}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, campaign)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCampaigns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Campaign
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Campaign Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Associated Form</InputLabel>
                <Select
                  value={formData.formId || ""}
                  label="Associated Form"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, formId: e.target.value }))
                  }
                >
                  <MenuItem value="">
                    <em>No form selected</em>
                  </MenuItem>
                  {dynamicForms
                    .filter((form) => form.isActive)
                    .map((form) => (
                      <MenuItem key={form.id} value={form.id}>
                        {form.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.formId && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Selected form will be used to capture leads for this campaign.
                  Make sure the form is properly configured before activating
                  the campaign.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingCampaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the campaign "
            {selectedCampaign?.name}"? This action cannot be undone.
          </Typography>
          {selectedCampaign?.leadCount && selectedCampaign.leadCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This campaign has {selectedCampaign.leadCount} associated leads.
              Deleting the campaign will not delete the leads, but they will
              lose their campaign association.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
