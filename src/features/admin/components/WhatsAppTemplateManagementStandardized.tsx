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
  Message as MessageIcon,
  Send as SendIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
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
import { WhatsAppTemplate, WhatsAppTemplateFormData } from '../types';
import { whatsappTemplateAPI } from '../services/api';

// Sample WhatsApp template data
const sampleTemplates: WhatsAppTemplate[] = [
  {
    id: '1',
    name: 'welcome_message',
    display_name: 'Welcome Message',
    category: 'utility',
    language: 'en',
    status: 'approved',
    body: 'Welcome to our service! We\'re excited to have you on board.',
    header: {
      type: 'text',
      text: 'Welcome to {{1}}'
    },
    footer: {
      text: 'Thank you for choosing us!'
    },
    buttons: [],
    variables: ['company_name'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'order_confirmation',
    display_name: 'Order Confirmation',
    category: 'marketing',
    language: 'en',
    status: 'pending',
    body: 'Your order #{{1}} has been confirmed. Total amount: ${{2}}. Expected delivery: {{3}}.',
    header: {
      type: 'text',
      text: 'Order Confirmation'
    },
    footer: {
      text: 'Track your order at {{4}}'
    },
    buttons: [
      {
        type: 'url',
        text: 'Track Order',
        url: 'https://example.com/track/{{5}}'
      }
    ],
    variables: ['order_id', 'amount', 'delivery_date', 'tracking_url', 'tracking_id'],
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-18T16:20:00Z',
  },
  {
    id: '3',
    name: 'appointment_reminder',
    display_name: 'Appointment Reminder',
    category: 'utility',
    language: 'en',
    status: 'approved',
    body: 'Reminder: You have an appointment scheduled for {{1}} at {{2}}. Please arrive 15 minutes early.',
    header: {
      type: 'text',
      text: 'Appointment Reminder'
    },
    footer: {
      text: 'Need to reschedule? Reply RESCHEDULE'
    },
    buttons: [
      {
        type: 'quick_reply',
        text: 'Confirm'
      },
      {
        type: 'quick_reply',
        text: 'Reschedule'
      }
    ],
    variables: ['date', 'time'],
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-12T09:30:00Z',
  },
  {
    id: '4',
    name: 'payment_reminder',
    display_name: 'Payment Reminder',
    category: 'utility',
    language: 'en',
    status: 'rejected',
    body: 'Your payment of ${{1}} is due on {{2}}. Please make the payment to avoid late fees.',
    header: {
      type: 'text',
      text: 'Payment Due'
    },
    footer: {
      text: 'Questions? Contact support'
    },
    buttons: [
      {
        type: 'url',
        text: 'Pay Now',
        url: 'https://example.com/pay/{{3}}'
      }
    ],
    variables: ['amount', 'due_date', 'payment_id'],
    created_at: '2024-01-08T14:20:00Z',
    updated_at: '2024-01-15T11:10:00Z',
  },
];

const WhatsAppTemplateManagementStandardized: React.FC = () => {
  // State for external controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Form and data states
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState<WhatsAppTemplateFormData>({
    name: '',
    display_name: '',
    category: 'utility',
    language: 'en',
    body: '',
    header: undefined,
    footer: undefined,
    buttons: [],
    variables: [],
  });
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Define columns for the template table
  const columns: TableColumn[] = [
    {
      key: 'display_name',
      label: 'Template',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <MessageIcon className="text-green-600" style={{ fontSize: '20px' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '120px',
      render: (value) => {
        const getColorClass = (category: string) => {
          switch (category) {
            case 'marketing': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'utility': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'authentication': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass(value)}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'language',
      label: 'Language',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="text-sm font-medium text-gray-700">
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => {
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'approved':
              return {
                icon: <ApprovedIcon style={{ fontSize: '14px' }} />,
                className: 'bg-green-100 text-green-800 border-green-200'
              };
            case 'pending':
              return {
                icon: <PendingIcon style={{ fontSize: '14px' }} />,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
              };
            case 'rejected':
              return {
                icon: <RejectedIcon style={{ fontSize: '14px' }} />,
                className: 'bg-red-100 text-red-800 border-red-200'
              };
            default:
              return {
                icon: null,
                className: 'bg-gray-100 text-gray-800 border-gray-200'
              };
          }
        };

        const config = getStatusConfig(value);
        
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            {config.icon}
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'variables',
      label: 'Variables',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((variable: string, index: number) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono"
            >
              {`{{${variable}}}`}
            </span>
          ))}
          {value.length > 2 && (
            <span className="text-xs text-gray-500">
              +{value.length - 2} more
            </span>
          )}
        </div>
      )
    }
  ];

  const sortOptions = [
    { label: 'Template Name', value: 'display_name' },
    { label: 'Category', value: 'category' },
    { label: 'Status', value: 'status' },
    { label: 'Created Date', value: 'created_at' },
  ];

  const handleAddTemplate = () => {
    setFormData({
      name: '',
      display_name: '',
      category: 'utility',
      language: 'en',
      body: '',
      header: undefined,
      footer: undefined,
      buttons: [],
      variables: [],
    });
    setCreateDialogOpen(true);
  };

  const handleDownload = () => {
    const csvContent = sampleTemplates
      .filter(template => selectedRows.length === 0 || selectedRows.includes(template.id))
      .map(template => 
        `${template.display_name},${template.name},${template.category},${template.language},${template.status}`
      )
      .join('\n');
    
    const blob = new Blob([`Display Name,Name,Category,Language,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-templates.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select some templates first',
        severity: 'warning'
      });
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} templates?`)) {
          setSnackbar({
            open: true,
            message: `${selectedRows.length} templates deleted successfully`,
            severity: 'success'
          });
          setSelectedRows([]);
        }
        break;
      case 'send':
        setSendDialogOpen(true);
        break;
    }
  };

  const customActions = [
    {
      label: 'View Template',
      icon: <Eye style={{ fontSize: '16px' }} />,
      onClick: (row: WhatsAppTemplate) => {
        setViewingTemplate(row);
        setViewDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit Template',
      icon: <Edit2 style={{ fontSize: '16px' }} />,
      onClick: (row: WhatsAppTemplate) => {
        setEditingTemplate(row);
        setFormData({
          name: row.name,
          display_name: row.display_name,
          category: row.category,
          language: row.language,
          body: row.body,
          header: row.header,
          footer: row.footer,
          buttons: row.buttons || [],
          variables: row.variables || [],
        });
        setEditDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Send Template',
      icon: <SendIcon style={{ fontSize: '16px' }} />,
      onClick: (row: WhatsAppTemplate) => {
        if (row.status !== 'approved') {
          setSnackbar({
            open: true,
            message: 'Only approved templates can be sent',
            severity: 'warning'
          });
          return;
        }
        setViewingTemplate(row);
        setSendDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-green-600'
    },
    {
      label: 'Delete Template',
      icon: <Trash2 style={{ fontSize: '16px' }} />,
      onClick: (row: WhatsAppTemplate) => {
        setViewingTemplate(row);
        setDeleteDialogOpen(true);
      },
      className: 'text-gray-600 hover:text-red-600'
    }
  ];

  const handleSave = async () => {
    // Implement save logic here
    setSnackbar({
      open: true,
      message: editingTemplate ? 'Template updated successfully' : 'Template created successfully',
      severity: 'success'
    });
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = async () => {
    if (viewingTemplate) {
      setSnackbar({
        open: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setViewingTemplate(null);
    }
  };

  const handleSend = async () => {
    setSnackbar({
      open: true,
      message: `Template sent to ${selectedRows.length || 1} recipient(s)`,
      severity: 'success'
    });
    setSendDialogOpen(false);
    setSelectedRows([]);
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
                  placeholder="Search templates..."
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
                onClick={handleAddTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <Plus style={{ fontSize: '16px' }} />
                + Add Template
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
                {selectedRows.length} template{selectedRows.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('send')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Send Selected
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
            data={sampleTemplates}
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
            emptyStateMessage="No WhatsApp templates found. Create your first template to get started."
          />
        </div>

        {/* Dialogs */}
        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setEditingTemplate(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingTemplate ? 'Edit WhatsApp Template' : 'Create New WhatsApp Template'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  helperText="Internal name (lowercase, underscores only)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    label="Category"
                  >
                    <MenuItem value="utility">Utility</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="authentication">Authentication</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message Body"
                  multiline
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  helperText="Use {{1}}, {{2}}, etc. for variables"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Variables (comma-separated)"
                  value={formData.variables?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    variables: e.target.value.split(',').map(v => v.trim()).filter(v => v) 
                  })}
                  helperText="e.g. first_name, order_id, amount"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setEditingTemplate(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained">
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setViewingTemplate(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Template Details</DialogTitle>
          <DialogContent>
            {viewingTemplate && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <MessageIcon className="text-green-600" style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <Typography variant="h6">{viewingTemplate.display_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {viewingTemplate.name} • {viewingTemplate.category}
                      </Typography>
                    </div>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Language</Typography>
                  <Typography>{viewingTemplate.language.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingTemplate.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : viewingTemplate.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingTemplate.status.charAt(0).toUpperCase() + viewingTemplate.status.slice(1)}
                  </span>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Message Body</Typography>
                  <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {viewingTemplate.body}
                    </Typography>
                  </Box>
                </Grid>
                {viewingTemplate.variables && viewingTemplate.variables.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Variables</Typography>
                    <Box sx={{ mt: 1 }}>
                      {viewingTemplate.variables.map((variable, index) => (
                        <Chip
                          key={index}
                          label={`{{${variable}}}`}
                          size="small"
                          sx={{ mr: 1, mb: 1, fontFamily: 'monospace' }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setViewDialogOpen(false);
              setViewingTemplate(null);
            }}>
              Close
            </Button>
            {viewingTemplate && (
              <Button 
                onClick={() => {
                  setEditingTemplate(viewingTemplate);
                  setFormData({
                    name: viewingTemplate.name,
                    display_name: viewingTemplate.display_name,
                    category: viewingTemplate.category,
                    language: viewingTemplate.language,
                    body: viewingTemplate.body,
                    header: viewingTemplate.header,
                    footer: viewingTemplate.footer,
                    buttons: viewingTemplate.buttons || [],
                    variables: viewingTemplate.variables || [],
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

        {/* Send Dialog */}
        <Dialog
          open={sendDialogOpen}
          onClose={() => setSendDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send WhatsApp Template</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Send template to recipients. This will send to {selectedRows.length || 1} recipient(s).
            </Typography>
            <TextField
              fullWidth
              label="Recipient Phone Numbers"
              multiline
              rows={4}
              placeholder="Enter phone numbers, one per line"
              helperText="Format: +1234567890"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} variant="contained">
              Send Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setViewingTemplate(null);
          }}
        >
          <DialogTitle>Delete Template</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingTemplate?.display_name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDeleteDialogOpen(false);
              setViewingTemplate(null);
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

export default WhatsAppTemplateManagementStandardized;
