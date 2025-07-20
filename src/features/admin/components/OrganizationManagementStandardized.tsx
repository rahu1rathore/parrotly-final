import React, { useState, useEffect } from 'react';
import { DataTable, TableColumn } from '../../../components/common/DataTable';
import {
  Visibility as Eye,
  Edit as Edit2,
  Delete as Trash2,
  Search,
  Add as Plus,
  Download,
  KeyboardArrowDown as ChevronDown,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Typography,
  Stack,
} from '@mui/material';
import { Organization, OrganizationFormData } from '../types';
import { organizationAPI } from '../services/api';

// Sample organization data
const sampleOrganizations: Organization[] = [
  {
    id: '1',
    name: 'TechCorp Industries',
    description: 'Leading technology solutions provider',
    contact_email: 'contact@techcorp.com',
    contact_phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 'Large',
    country: 'United States',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Global Healthcare Solutions',
    description: 'Healthcare management and consulting',
    contact_email: 'info@globalhealthcare.com',
    contact_phone: '+1 (555) 987-6543',
    address: '456 Medical Plaza, Healthcare City, NY 10001',
    website: 'https://globalhealthcare.com',
    industry: 'Healthcare',
    size: 'Medium',
    country: 'United States',
    is_active: true,
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-18T16:20:00Z',
  },
  {
    id: '3',
    name: 'EduLearn Institute',
    description: 'Online education and training platform',
    contact_email: 'support@edulearn.edu',
    contact_phone: '+1 (555) 456-7890',
    address: '789 Education Ave, Learning City, TX 75000',
    website: 'https://edulearn.edu',
    industry: 'Education',
    size: 'Small',
    country: 'United States',
    is_active: false,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-12T09:30:00Z',
  },
];

const OrganizationManagementStandardized: React.FC = () => {
  // State for external controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Form and data states
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    industry: '',
    size: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Define columns for the organization table
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Organization',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BusinessIcon className="text-blue-600" style={{ fontSize: '20px' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.industry}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact_email',
      label: 'Contact',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <EmailIcon style={{ fontSize: '16px' }} className="text-gray-400" />
            {value}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <PhoneIcon style={{ fontSize: '16px' }} className="text-gray-400" />
            {row.contact_phone}
          </div>
        </div>
      )
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      width: '100px',
      render: (value) => {
        const getColorClass = (size: string) => {
          switch (size) {
            case 'Small': return 'bg-green-100 text-green-800 border-green-200';
            case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Large': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass(value)}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'country',
      label: 'Location',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.address?.split(',').slice(-2).join(',').trim()}</div>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          value 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const sortOptions = [
    { label: 'Organization Name', value: 'name' },
    { label: 'Industry', value: 'industry' },
    { label: 'Size', value: 'size' },
    { label: 'Created Date', value: 'created_at' },
  ];

  const handleAddOrganization = () => {
    setFormData({
      name: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
      industry: '',
      size: '',
      country: '',
    });
    setCreateDialogOpen(true);
  };

  const handleDownload = () => {
    const csvContent = sampleOrganizations
      .filter(org => selectedRows.length === 0 || selectedRows.includes(org.id))
      .map(org => 
        `${org.name},${org.contact_email},${org.contact_phone},${org.industry},${org.size},${org.country},${org.is_active ? 'Active' : 'Inactive'}`
      )
      .join('\n');
    
    const blob = new Blob([`Name,Email,Phone,Industry,Size,Country,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organizations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select some organizations first',
        severity: 'warning'
      });
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} organizations?`)) {
          setSnackbar({
            open: true,
            message: `${selectedRows.length} organizations deleted successfully`,
            severity: 'success'
          });
          setSelectedRows([]);
        }
        break;
      case 'activate':
        setSnackbar({
          open: true,
          message: `${selectedRows.length} organizations activated`,
          severity: 'success'
        });
        setSelectedRows([]);
        break;
    }
  };

  const customActions = [
    {
      label: 'View Details',
      icon: <Eye style={{ fontSize: '16px' }} />,
      onClick: (row: Organization) => {
        setViewingOrganization(row);
        setViewDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit Organization',
      icon: <Edit2 style={{ fontSize: '16px' }} />,
      onClick: (row: Organization) => {
        setEditingOrganization(row);
        setFormData({
          name: row.name,
          description: row.description || '',
          contact_email: row.contact_email,
          contact_phone: row.contact_phone,
          address: row.address || '',
          website: row.website || '',
          industry: row.industry,
          size: row.size,
          country: row.country,
        });
        setEditDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete Organization',
      icon: <Trash2 style={{ fontSize: '16px' }} />,
      onClick: (row: Organization) => {
        setViewingOrganization(row);
        setDeleteDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-red-600'
    }
  ];

  const handleSave = async () => {
    // Implement save logic here
    setSnackbar({
      open: true,
      message: editingOrganization ? 'Organization updated successfully' : 'Organization created successfully',
      severity: 'success'
    });
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingOrganization(null);
  };

  const handleDelete = async () => {
    if (viewingOrganization) {
      setSnackbar({
        open: true,
        message: 'Organization deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setViewingOrganization(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Unified Controls Row */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Side - Search and Filters */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  style={{ fontSize: '16px' }} 
                />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Center - Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="">Sort by...</option>
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                style={{ fontSize: '16px' }} 
              />
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddOrganization}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <Plus style={{ fontSize: '16px' }} />
                + Add Organization
              </button>

              <button
                onClick={handleDownload}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg flex items-center transition-colors duration-200"
                title="Download data"
              >
                <Download style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedRows.length} organization{selectedRows.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedRows([])}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm transition-colors duration-200"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DataTable */}
        <div className="bg-white rounded-lg shadow-lg">
          <DataTable
            columns={columns}
            data={sampleOrganizations}
            searchable={false}
            sortable={true}
            pagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 25, 50]}
            actions={customActions}
            showTopControls={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showCheckboxes={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdField="id"
            className=""
            emptyStateMessage="No organizations found. Add your first organization to get started."
          />
        </div>

        {/* Dialogs */}
        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setEditingOrganization(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingOrganization ? 'Edit Organization' : 'Create New Organization'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    label="Industry"
                  >
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Retail">Retail</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization Size</InputLabel>
                  <Select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    label="Organization Size"
                  >
                    <MenuItem value="Small">Small (1-50 employees)</MenuItem>
                    <MenuItem value="Medium">Medium (51-200 employees)</MenuItem>
                    <MenuItem value="Large">Large (200+ employees)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setEditingOrganization(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained">
              {editingOrganization ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setViewingOrganization(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Organization Details</DialogTitle>
          <DialogContent>
            {viewingOrganization && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BusinessIcon className="text-blue-600" style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <Typography variant="h6">{viewingOrganization.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {viewingOrganization.industry} • {viewingOrganization.size}
                      </Typography>
                    </div>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Email</Typography>
                  <Typography>{viewingOrganization.contact_email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Phone</Typography>
                  <Typography>{viewingOrganization.contact_phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Website</Typography>
                  <Typography>{viewingOrganization.website || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingOrganization.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingOrganization.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography>{viewingOrganization.address || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography>{viewingOrganization.description || 'No description provided'}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setViewDialogOpen(false);
              setViewingOrganization(null);
            }}>
              Close
            </Button>
            {viewingOrganization && (
              <Button 
                onClick={() => {
                  setEditingOrganization(viewingOrganization);
                  setFormData({
                    name: viewingOrganization.name,
                    description: viewingOrganization.description || '',
                    contact_email: viewingOrganization.contact_email,
                    contact_phone: viewingOrganization.contact_phone,
                    address: viewingOrganization.address || '',
                    website: viewingOrganization.website || '',
                    industry: viewingOrganization.industry,
                    size: viewingOrganization.size,
                    country: viewingOrganization.country,
                  });
                  setViewDialogOpen(false);
                  setEditDialogOpen(true);
                }}
                variant="contained"
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setViewingOrganization(null);
          }}
        >
          <DialogTitle>Delete Organization</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingOrganization?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDeleteDialogOpen(false);
              setViewingOrganization(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
      </div>
    </div>
  );
};

export default OrganizationManagementStandardized;
