import React from 'react';
import { DataTable, TableColumn } from './DataTable';

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
  }
];

const DataTableExample: React.FC = () => {
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

  const customActions = [
    {
      label: 'View Profile',
      icon: <div className="w-4 h-4 rounded-full bg-gray-400"></div>,
      onClick: (row: any) => console.log('View profile:', row),
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit Customer',
      icon: <div className="w-4 h-4 bg-yellow-400"></div>,
      onClick: (row: any) => console.log('Edit customer:', row),
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete Customer',
      icon: <div className="w-4 h-4 bg-red-400"></div>,
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database with advanced filtering and actions.</p>
        </div>

        <DataTable
          columns={columns}
          data={sampleCustomers}
          searchable={true}
          sortable={true}
          actions={customActions}
          onAdd={handleAddCustomer}
          onDownload={handleDownload}
          addButtonText="+ Add Customer"
          searchPlaceholder="Search 200 records..."
          sortOptions={sortOptions}
          className="shadow-lg"
          rowClassName={(row) => 
            row.status === 'Verified' ? 'bg-green-50' : 
            row.status === 'Rejected' ? 'bg-red-50' : 
            'bg-white'
          }
          emptyStateMessage="No customers found. Add your first customer to get started."
        />
      </div>
    </div>
  );
};

export default DataTableExample;
