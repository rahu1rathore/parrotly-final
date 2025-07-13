import React, { useState } from "react";
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
  DialogContentText,
  Tooltip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { WhatsAppTemplate } from "../types";

interface TemplateListViewProps {
  templates: WhatsAppTemplate[];
  loading?: boolean;
  onEdit: (template: WhatsAppTemplate) => void;
  onDelete: (templateId: string) => void;
  onSend: (template: WhatsAppTemplate) => void;
  onViewDetails: (template: WhatsAppTemplate) => void;
  onCreate: () => void;
  onRefresh?: () => void;
}

const STATUS_COLORS = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  disabled: "default",
} as const;

const CATEGORY_COLORS = {
  marketing: "#FF6B35",
  utility: "#4ECDC4",
  authentication: "#45B7D1",
};

export default function TemplateListView({
  templates,
  loading = false,
  onEdit,
  onDelete,
  onSend,
  onViewDetails,
  onCreate,
  onRefresh,
}: TemplateListViewProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<WhatsAppTemplate | null>(null);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Paginate templates
  const paginatedTemplates = filteredTemplates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    template: WhatsAppTemplate,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      onEdit(selectedTemplate);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      setTemplateToDelete(selectedTemplate);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      onDelete(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSend = () => {
    if (selectedTemplate) {
      onSend(selectedTemplate);
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (selectedTemplate) {
      onViewDetails(selectedTemplate);
    }
    handleMenuClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderStatusChip = (status: WhatsAppTemplate["status"]) => (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLORS[status]}
      size="small"
      variant="filled"
    />
  );

  const renderCategoryChip = (category: WhatsAppTemplate["category"]) => (
    <Chip
      label={category.charAt(0).toUpperCase() + category.slice(1)}
      size="small"
      sx={{
        backgroundColor: CATEGORY_COLORS[category],
        color: "white",
        fontWeight: 500,
      }}
    />
  );

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <Box>
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
            WhatsApp Templates ({filteredTemplates.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                /* Export functionality */
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
            >
              Create Template
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
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

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="utility">Utility</MenuItem>
                <MenuItem value="authentication">Authentication</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
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

      {/* Templates Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Variables</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>Loading templates...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>
                      {filteredTemplates.length === 0 && templates.length > 0
                        ? "No templates match your search criteria"
                        : "No templates found. Create your first template to get started."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTemplates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {truncateText(template.body)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      {renderCategoryChip(template.category)}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {template.language.toUpperCase()}
                      </Typography>
                    </TableCell>

                    <TableCell>{renderStatusChip(template.status)}</TableCell>

                    <TableCell>
                      {template.variables && template.variables.length > 0 ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {template.variables.slice(0, 2).map((variable) => (
                            <Chip
                              key={variable}
                              label={`{{${variable}}}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {template.variables.length > 2 && (
                            <Chip
                              label={`+${template.variables.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No variables
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(template.createdDate), "MMM dd, yyyy")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(template.createdDate), "hh:mm a")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}
                        >
                          {template.createdBy.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {template.createdBy.split("@")[0]}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, template)}
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
          count={filteredTemplates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>

        {selectedTemplate?.status === "approved" && (
          <MenuItem onClick={handleSend}>
            <SendIcon sx={{ mr: 1 }} />
            Send Template
          </MenuItem>
        )}

        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Template
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Template
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template "
            {templateToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
          {templateToDelete?.status === "approved" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This template is currently approved and may be in use. Deleting it
              will prevent future sends using this template.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
