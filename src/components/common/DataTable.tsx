import React, { useState, useEffect, useMemo } from 'react';
import {
  MoreVert as MoreVertical,
  Visibility as Eye,
  Edit as Edit2,
  Delete as Trash2,
  Add as Plus,
  Download,
  Search,
  KeyboardArrowDown as ChevronDown,
  KeyboardArrowUp as ChevronUp,
  UnfoldMore as ArrowUpDown
} from '@mui/icons-material';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface TableAction {
  label: string;
  icon: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
}

export interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  actions?: TableAction[];
  onAdd?: () => void;
  onDownload?: () => void;
  addButtonText?: string;
  searchPlaceholder?: string;
  sortOptions?: { label: string; value: string }[];
  className?: string;
  rowClassName?: (row: any) => string;
  emptyStateMessage?: string;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  searchable = true,
  sortable = true,
  actions = [],
  onAdd,
  onDownload,
  addButtonText = '+ Add Customer',
  searchPlaceholder = 'Search 200 records...',
  sortOptions = [],
  className = '',
  rowClassName,
  emptyStateMessage = 'No data available',
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
    const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Default actions if none provided
  const defaultActions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row) => console.log('View:', row),
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: (row) => console.log('Edit:', row),
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row) => console.log('Delete:', row),
      className: 'text-gray-600 hover:text-red-600'
    }
  ];

  const tableActions = actions.length > 0 ? actions : defaultActions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchTerm && searchable) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortBy, sortOrder, searchable]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const handleDropdownToggle = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Top Bar Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Side - Search */}
          <div className="flex-1 max-w-md">
            {searchable && (
              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ fontSize: '16px' }} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            )}
          </div>

          {/* Right Side - Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            {sortable && sortOptions.length > 0 && (
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
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }} />
              </div>
            )}

            {/* Add Button */}
            {onAdd && (
              <button
                onClick={onAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                                <Plus style={{ fontSize: '16px' }} />
                {addButtonText}
              </button>
            )}

            {/* Download Button */}
            {onDownload && (
              <button
                onClick={onDownload}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg flex items-center transition-colors duration-200"
                title="Download data"
              >
                                <Download style={{ fontSize: '16px' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Checkbox Column */}
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:text-gray-700' : ''
                  } ${column.className || ''}`}
                  style={column.width ? { width: column.width } : {}}
                  onClick={() => column.sortable !== false && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                                                        <ChevronUp style={{ fontSize: '12px' }} />
                          ) : (
                                                        <ChevronDown style={{ fontSize: '12px' }} />
                          )
                        ) : (
                                                    <ArrowUpDown style={{ fontSize: '12px' }} className="text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              {tableActions.length > 0 && (
                <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading State
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                  {tableActions.length > 0 && (
                    <td className="px-4 py-4 text-center">
                      <div className="w-6 h-6 bg-gray-200 rounded mx-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : processedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (tableActions.length > 0 ? 2 : 1)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              // Data Rows
              processedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    rowClassName ? rowClassName(row) : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4 text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'}
                    </td>
                  ))}

                  {/* Actions */}
                  {tableActions.length > 0 && (
                    <td className="px-4 py-4 text-center">
                      <div className="relative">
                        <button
                          onClick={(e) => handleDropdownToggle(index, e)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-md hover:bg-gray-100"
                        >
                                                    <MoreVertical style={{ fontSize: '16px' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === index && (
                          <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            {tableActions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => {
                                  action.onClick(row);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                  action.className || 'text-gray-700'
                                }`}
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>
            Showing {processedData.length} of {data.length} records
          </span>
          {searchTerm && (
            <span className="text-blue-600">
              Filtered by: "{searchTerm}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
