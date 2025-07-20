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
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
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
  Chip,
  Box,
} from '@mui/material';
import { Subscription, SubscriptionFormData } from '../types';
import { subscriptionAPI } from '../services/api';

// Sample subscription data
const sampleSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Basic Plan',
    description: 'Perfect for small teams and startups',
    price: 29.99,
    billing_cycle: 'monthly',
    features: ['Up to 5 users', 'Basic analytics', 'Email support'],
    max_users: 5,
    is_active: true,
    is_popular: false,
    trial_days: 14,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Pro Plan',
    description: 'Advanced features for growing businesses',
    price: 79.99,
    billing_cycle: 'monthly',
    features: ['Up to 25 users', 'Advanced analytics', 'Priority support', 'Custom integrations'],
    max_users: 25,
    is_active: true,
    is_popular: true,
    trial_days: 14,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Enterprise Plan',
    description: 'Complete solution for large organizations',
    price: 199.99,
    billing_cycle: 'monthly',
    features: ['Unlimited users', 'Premium analytics', '24/7 support', 'Custom development'],
    max_users: -1, // Unlimited
    is_active: true,
    is_popular: false,
    trial_days: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-18T16:20:00Z',
  },
  {
    id: '4',
    name: 'Starter Plan',
    description: 'Basic features for individuals',
    price: 9.99,
    billing_cycle: 'monthly',
    features: ['1 user', 'Basic features', 'Community support'],
    max_users: 1,
    is_active: false,
    is_popular: false,
    trial_days: 7,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-12T09:30:00Z',
  },
];

const SubscriptionManagementStandardized: React.FC = () => {
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
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    features: [],
    max_users: 1,
    trial_days: 14,
  });
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Define columns for the subscription table
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Plan',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            row.is_popular 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {row.is_popular ? (
              <StarIcon style={{ fontSize: '20px' }} />
            ) : (
              <MoneyIcon style={{ fontSize: '20px' }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{value}</span>
              {row.is_popular && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  Popular
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      width: '120px',
      render: (value, row) => (
        <div>
          <div className="text-lg font-bold text-gray-900">
            ${value}
            <span className="text-sm font-normal text-gray-500">
              /{row.billing_cycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          {row.trial_days > 0 && (
            <div className="text-xs text-green-600">
              {row.trial_days}-day trial
            </div>
          )}
        </div>
      )
    },
    {
      key: 'max_users',
      label: 'Users',
      sortable: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <GroupIcon style={{ fontSize: '16px' }} className="text-gray-400" />
          <span className="text-sm font-medium">
            {value === -1 ? 'Unlimited' : value}
          </span>
        </div>
      )
    },
    {
      key: 'features',
      label: 'Features',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((feature: string, index: number) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {feature}
            </span>
          ))}
          {value.length > 2 && (
            <span className="text-xs text-gray-500">
              +{value.length - 2} more
            </span>
          )}
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
    { label: 'Plan Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Max Users', value: 'max_users' },
    { label: 'Created Date', value: 'created_at' },
  ];

  const handleAddSubscription = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      billing_cycle: 'monthly',
      features: [],
      max_users: 1,
      trial_days: 14,
    });
    setCreateDialogOpen(true);
  };

  const handleDownload = () => {
    const csvContent = sampleSubscriptions
      .filter(sub => selectedRows.length === 0 || selectedRows.includes(sub.id))
      .map(sub => 
        `${sub.name},${sub.price},${sub.billing_cycle},${sub.max_users === -1 ? 'Unlimited' : sub.max_users},${sub.is_active ? 'Active' : 'Inactive'}`
      )
      .join('\n');
    
    const blob = new Blob([`Name,Price,Billing,Users,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select some subscription plans first',
        severity: 'warning'
      });
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} subscription plans?`)) {
          setSnackbar({
            open: true,
            message: `${selectedRows.length} subscription plans deleted successfully`,
            severity: 'success'
          });
          setSelectedRows([]);
        }
        break;
      case 'activate':
        setSnackbar({
          open: true,
          message: `${selectedRows.length} subscription plans activated`,
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
      onClick: (row: Subscription) => {
        setViewingSubscription(row);
        setViewDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit Plan',
      icon: <Edit2 style={{ fontSize: '16px' }} />,
      onClick: (row: Subscription) => {
        setEditingSubscription(row);
        setFormData({
          name: row.name,
          description: row.description || '',
          price: row.price,
          billing_cycle: row.billing_cycle,
          features: row.features || [],
          max_users: row.max_users,
          trial_days: row.trial_days || 14,
        });
        setEditDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete Plan',
      icon: <Trash2 style={{ fontSize: '16px' }} />,
      onClick: (row: Subscription) => {
        setViewingSubscription(row);
        setDeleteDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-red-600'
    }
  ];

  const handleSave = async () => {
    // Implement save logic here
    setSnackbar({
      open: true,
      message: editingSubscription ? 'Subscription plan updated successfully' : 'Subscription plan created successfully',
      severity: 'success'
    });
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingSubscription(null);
  };

  const handleDelete = async () => {
    if (viewingSubscription) {
      setSnackbar({
        open: true,
        message: 'Subscription plan deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setViewingSubscription(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Unified Controls Row */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Side - Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  style={{ fontSize: '16px' }} 
                />
                <input
                  type="text"
                  placeholder="Search subscription plans..."
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
                onClick={handleAddSubscription}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <Plus style={{ fontSize: '16px' }} />
                + Add Plan
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
                {selectedRows.length} plan{selectedRows.length === 1 ? '' : 's'} selected
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
            data={sampleSubscriptions}
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
            emptyStateMessage="No subscription plans found. Create your first plan to get started."
          />
        </div>

        {/* Dialogs */}
        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setEditingSubscription(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingSubscription ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                  InputProps={{
                    startAdornment: <span className="mr-2">$</span>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as 'monthly' | 'yearly' })}
                    label="Billing Cycle"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Users"
                  type="number"
                  value={formData.max_users === -1 ? '' : formData.max_users}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_users: e.target.value === '' ? -1 : parseInt(e.target.value) || 1 
                  })}
                  helperText="Leave empty for unlimited users"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trial Days"
                  type="number"
                  value={formData.trial_days}
                  onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Features (one per line)"
                  multiline
                  rows={4}
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    features: e.target.value.split('\n').filter(f => f.trim()) 
                  })}
                  helperText="Enter each feature on a new line"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setEditingSubscription(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained">
              {editingSubscription ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setViewingSubscription(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Subscription Plan Details</DialogTitle>
          <DialogContent>
            {viewingSubscription && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      viewingSubscription.is_popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {viewingSubscription.is_popular ? (
                        <StarIcon style={{ fontSize: '24px' }} />
                      ) : (
                        <MoneyIcon style={{ fontSize: '24px' }} />
                      )}
                    </div>
                    <div>
                      <Typography variant="h6" className="flex items-center gap-2">
                        {viewingSubscription.name}
                        {viewingSubscription.is_popular && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Popular
                          </span>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {viewingSubscription.description}
                      </Typography>
                    </div>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                  <Typography variant="h6">
                    ${viewingSubscription.price}
                    <span className="text-sm font-normal text-gray-500">
                      /{viewingSubscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Max Users</Typography>
                  <Typography variant="h6">
                    {viewingSubscription.max_users === -1 ? 'Unlimited' : viewingSubscription.max_users}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Trial Period</Typography>
                  <Typography>{viewingSubscription.trial_days} days</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingSubscription.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingSubscription.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Features</Typography>
                  <Box sx={{ mt: 1 }}>
                    {viewingSubscription.features?.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setViewDialogOpen(false);
              setViewingSubscription(null);
            }}>
              Close
            </Button>
            {viewingSubscription && (
              <Button 
                onClick={() => {
                  setEditingSubscription(viewingSubscription);
                  setFormData({
                    name: viewingSubscription.name,
                    description: viewingSubscription.description || '',
                    price: viewingSubscription.price,
                    billing_cycle: viewingSubscription.billing_cycle,
                    features: viewingSubscription.features || [],
                    max_users: viewingSubscription.max_users,
                    trial_days: viewingSubscription.trial_days || 14,
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
            setViewingSubscription(null);
          }}
        >
          <DialogTitle>Delete Subscription Plan</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingSubscription?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDeleteDialogOpen(false);
              setViewingSubscription(null);
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

export default SubscriptionManagementStandardized;
