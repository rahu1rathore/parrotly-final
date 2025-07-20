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
  UnfoldMore as ArrowUpDown,
  ChevronLeft,
  ChevronRight
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
  showTopControls?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  // Checkbox selection
  showCheckboxes?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  rowIdField?: string;
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
  pageSizeOptions = [10, 25, 50, 100],
  showTopControls = true,
  searchTerm: externalSearchTerm,
  onSearchChange,
  sortBy: externalSortBy,
  onSortChange,
  // Checkbox selection
  showCheckboxes = true,
  selectedRows = [],
  onSelectionChange,
  rowIdField = 'id'
}) => {
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalSortBy, setInternalSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Use external state if provided, otherwise use internal state
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
  };

  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    } else {
      setInternalSortBy(value);
    }
  };

  // Default actions if none provided
  const defaultActions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye style={{ fontSize: '16px' }} />,
      onClick: (row) => console.log('View:', row),
      className: 'text-gray-600 hover:text-blue-600'
    },
    {
      label: 'Edit',
      icon: <Edit2 style={{ fontSize: '16px' }} />,
      onClick: (row) => console.log('Edit:', row),
      className: 'text-gray-600 hover:text-yellow-600'
    },
    {
      label: 'Delete',
      icon: <Trash2 style={{ fontSize: '16px' }} />,
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

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, currentPageSize]);

  // Filter, sort and paginate data
  const { paginatedData, totalItems, totalPages } = useMemo(() => {
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

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / currentPageSize);
    
    if (pagination) {
      const startIndex = (currentPage - 1) * currentPageSize;
      const endIndex = startIndex + currentPageSize;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      return { paginatedData, totalItems, totalPages };
    }

    return { paginatedData: filtered, totalItems, totalPages: 1 };
  }, [data, searchTerm, sortBy, sortOrder, searchable, currentPage, currentPageSize, pagination]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust startPage if endPage is at the limit
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            {/* Top Bar Controls - Only show if showTopControls is true */}
      {showTopControls && (
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
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                    onChange={(e) => handleSortChange(e.target.value)}
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
      )}

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
            ) : paginatedData.length === 0 ? (
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
              paginatedData.map((row, index) => (
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

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Left side - Entry info and page size */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * currentPageSize) + 1} to {Math.min(currentPage * currentPageSize, totalItems)} of {totalItems} entries
              </span>
              
              {/* Entries per page dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={currentPageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
            </div>

            {/* Right side - Page navigation */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft style={{ fontSize: '16px' }} />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple footer for non-paginated tables */}
      {!pagination && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>
              Showing {paginatedData.length} of {totalItems} records
            </span>
            {searchTerm && (
              <span className="text-blue-600">
                Filtered by: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
