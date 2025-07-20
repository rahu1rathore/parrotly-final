import React, { useState } from 'react';
import { DataTable, TableColumn } from './DataTable';
import {
  Visibility as Eye,
  Edit as Edit2,
  Delete as Trash2,
  Search,
  Add as Plus,
  Download,
  KeyboardArrowDown as ChevronDown
} from '@mui/icons-material';

// Sample customer data that matches the reference image
const sampleCustomers = [
  {
    id: '102',
    avatar: 'https://ui-avatars.com/api/?name=Ada+Evans&background=ff6b6b&color=fff',
    userName: 'Ada Evans',
    email: 'johnexample@gmail.com',
    contact: '+1 (232) 479-2902',
    age: 32,
    country: 'St. Pierre & Miquelon',
    status: 'Rejected'
  },
  {
    id: '34',
    avatar: 'https://ui-avatars.com/api/?name=Adele+McDaniel&background=51cf66&color=fff',
    userName: 'Adele McDaniel',
    email: 'leg@email.com',
    contact: '+1 (227) 665-3977',
    age: 22,
    country: 'Argentina',
    status: 'Verified'
  },
  {
    id: '180',
    avatar: 'https://ui-avatars.com/api/?name=Adele+Mills&background=339af0&color=fff',
    userName: 'Adele Mills',
    email: 'leg@mailsapple@gmail.com',
    contact: '+1 (303) 494-7324',
    age: 45,
    country: 'Congo - Kinshasa',
    status: 'Verified'
  },
  {
    id: '161',
    avatar: 'https://ui-avatars.com/api/?name=Aiden+Fletcher&background=ffd43b&color=000',
    userName: 'Aiden Fletcher',
    email: 'arshippro@gmail.com',
    contact: '+1 (412) 605-2121',
    age: 42,
    country: 'Kuwait',
    status: 'Rejected'
  },
  {
    id: '15',
    avatar: 'https://ui-avatars.com/api/?name=Albert+Wood&background=74c0fc&color=fff',
    userName: 'Albert Wood',
    email: 'bill@gmail.com',
    contact: '+1 (419) 627-2135',
    age: 39,
    country: 'Caribbean Netherlands',
    status: 'Rejected'
  },
  {
    id: '134',
    avatar: 'https://ui-avatars.com/api/?name=Alice+Bishop&background=ff8cc8&color=fff',
    userName: 'Alice Bishop',
    email: 'test@example.com',
    contact: '+1 (657) 598-8679',
    age: 55,
    country: 'Senegal',
    status: 'Rejected'
  },
  {
    id: '176',
    avatar: 'https://ui-avatars.com/api/?name=Alma+Gibbs&background=339af0&color=fff',
    userName: 'Alma Gibbs',
    email: 'dieg@gmail.com',
    contact: '+1 (326) 217-8189',
    age: 40,
    country: 'Morocco',
    status: 'Rejected'
  },
  {
    id: '162',
    avatar: 'https://ui-avatars.com/api/?name=Alvin+Price&background=ffd43b&color=000',
    userName: 'Alvin Price',
    email: 'chris@gmail.com',
    contact: '+1 (517) 445-5660',
    age: 65,
    country: 'Austria',
    status: 'Pending'
  },
  {
    id: '65',
    avatar: 'https://ui-avatars.com/api/?name=Amanda+Gibbs&background=51cf66&color=fff',
    userName: 'Amanda Gibbs',
    email: 'rug@gmail.com',
    contact: '+1 (331) 350-1168',
    age: 61,
    country: 'Togo',
    status: 'Verified'
  },
  // Add more customers to test scrolling
  {
    id: '200',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
    userName: 'John Doe',
    email: 'john@example.com',
    contact: '+1 (555) 123-4567',
    age: 28,
    country: 'United States',
    status: 'Verified'
  },
  {
    id: '201',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=f59e0b&color=fff',
    userName: 'Jane Smith',
    email: 'jane@example.com',
    contact: '+1 (555) 987-6543',
    age: 35,
    country: 'Canada',
    status: 'Pending'
  },
  {
    id: '202',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=10b981&color=fff',
    userName: 'Bob Wilson',
    email: 'bob@example.com',
    contact: '+1 (555) 456-7890',
    age: 41,
    country: 'United Kingdom',
    status: 'Verified'
  }
];

const DataTableExample: React.FC = () => {
  // State for external controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Define columns matching the reference image
  const columns: TableColumn[] = [
    {
      key: 'id',
      label: '#',
      width: '60px',
      sortable: true
    },
    {
      key: 'userName',
      label: 'User Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={value}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: true
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      width: '80px'
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => {
        const getStatusStyle = (status: string) => {
          switch (status.toLowerCase()) {
            case 'verified':
              return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
              return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
              return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
              value
            )}`}
          >
            {value}
          </span>
        );
      }
    }
  ];

  const sortOptions = [
    { label: 'User Name', value: 'userName' },
    { label: 'Age', value: 'age' },
    { label: 'Country', value: 'country' },
    { label: 'Status', value: 'status' }
  ];

  const handleAddCustomer = () => {
    console.log('Add customer clicked');
    // Add your customer creation logic here
  };

  const handleDownload = () => {
    console.log('Download clicked');
    // Add your download logic here
    const csvContent = sampleCustomers
      .map(customer => 
        `${customer.id},${customer.userName},${customer.email},${customer.contact},${customer.age},${customer.country},${customer.status}`
      )
      .join('\n');
    
    const blob = new Blob([`ID,Name,Email,Contact,Age,Country,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} on:`, selectedRows);
    // Implement bulk actions here
    if (selectedRows.length === 0) {
      alert('Please select some rows first');
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} customers?`)) {
          console.log('Bulk delete confirmed');
          setSelectedRows([]);
        }
        break;
      case 'export':
        console.log('Bulk export');
        break;
      case 'verify':
        console.log('Bulk verify');
        setSelectedRows([]);
        break;
    }
  };

  const customActions = [
    {
      label: 'View Profile',
      icon: <Eye style={{ fontSize: '16px' }} />,
      onClick: (row: any) => console.log('View profile:', row),
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit Customer',
      icon: <Edit2 style={{ fontSize: '16px' }} />,
      onClick: (row: any) => console.log('Edit customer:', row),
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete Customer',
      icon: <Trash2 style={{ fontSize: '16px' }} />,
      onClick: (row: any) => {
        if (window.confirm(`Are you sure you want to delete ${row.userName}?`)) {
          console.log('Delete customer:', row);
        }
      },
      className: 'text-gray-600 hover:text-red-600'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Separated Top Controls */}
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
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side - Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
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

              {/* Add Button */}
              <button
                onClick={handleAddCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <Plus style={{ fontSize: '16px' }} />
                + Add Customer
              </button>

              {/* Download Button */}
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

        {/* Bulk Actions Bar - Show when rows are selected */}
        {selectedRows.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedRows.length} customer{selectedRows.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                >
                  Export Selected
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

        {/* DataTable with fixed container height and proper scrolling */}
        <div className="bg-white rounded-lg shadow-lg">
          <DataTable
            columns={columns}
            data={sampleCustomers}
            searchable={false} // We handle search externally
            sortable={true}
            pagination={true}
            pageSize={5}
            pageSizeOptions={[5, 10, 25, 50]}
            actions={customActions}
            showTopControls={false} // Hide built-in controls
            searchTerm={searchTerm} // Pass external search state
            onSearchChange={setSearchTerm}
            sortBy={sortBy} // Pass external sort state  
            onSortChange={setSortBy}
            // Checkbox selection
            showCheckboxes={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdField="id"
            className=""
            rowClassName={(row) => 
              row.status === 'Verified' ? '' : 
              row.status === 'Rejected' ? '' : 
              ''
            }
            emptyStateMessage="No customers found. Try adjusting your search or filters."
          />
        </div>
      </div>
    </div>
  );
};

export default DataTableExample;
