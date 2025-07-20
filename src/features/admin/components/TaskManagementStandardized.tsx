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
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { format, isAfter } from "date-fns";
import { Task, TaskFormData, Lead, Agent } from "../types";

interface TaskManagementStandardizedProps {
  onTasksChange?: () => void;
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface FilterState {
  search: string;
  status: "all" | "pending" | "in_progress" | "completed" | "cancelled";
  priority: "all" | "low" | "medium" | "high";
  assignedTo: string;
  sortBy: "title" | "due_date" | "created_date" | "priority";
  sortOrder: "asc" | "desc";
}

const STATUS_COLORS = {
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  completed: "#10b981",
  cancelled: "#ef4444",
} as const;

const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
} as const;

const TaskManagementStandardized: React.FC<TaskManagementStandardizedProps> = ({
  onTasksChange,
}) => {
  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
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
    complete: false,
  });

  // Form state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    leadId: "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    assignedTo: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<TaskFormData>>({});

  // Menu state for actions dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<Task | null>(null);

  // Mock data
  const mockTasks: Task[] = [
    {
      id: "1",
      leadId: "lead1",
      title: "Follow up call",
      description: "Call customer to discuss requirements",
      dueDate: new Date().toISOString(),
      priority: "high",
      status: "pending",
      assignedTo: "agent1",
      assignedToName: "Agent Smith",
      createdDate: new Date().toISOString(),
      createdByName: "Manager",
      reminderDate: new Date().toISOString(),
    },
    {
      id: "2",
      leadId: "lead2", 
      title: "Send proposal",
      description: "Prepare and send detailed proposal",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: "medium",
      status: "in_progress",
      assignedTo: "agent2",
      assignedToName: "Agent Jones",
      createdDate: new Date().toISOString(),
      createdByName: "Manager",
    },
  ];

  const mockLeads: Lead[] = [
    {
      id: "lead1",
      campaignId: "campaign1",
      campaignName: "Summer Campaign",
      phoneNumber: "+1234567890",
      data: { fullName: "John Doe" },
      status: "new",
      priority: "high",
      source: "Website",
      createdDate: new Date().toISOString(),
    },
    {
      id: "lead2",
      campaignId: "campaign2",
      campaignName: "Winter Promo",
      phoneNumber: "+1234567891",
      data: { fullName: "Jane Smith" },
      status: "contacted",
      priority: "medium",
      source: "Cold Call",
      createdDate: new Date().toISOString(),
    },
  ];

  const mockAgents: Agent[] = [
    { id: "agent1", name: "Agent Smith", assignedLeadsCount: 15 },
    { id: "agent2", name: "Agent Jones", assignedLeadsCount: 12 },
  ];

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadTasks();
    loadLeads();
    loadAgents();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // API functions
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with filters
      let filteredData = [...mockTasks];

      if (filters.search) {
        filteredData = filteredData.filter((task) => {
          const searchTerm = filters.search.toLowerCase();
          return (
            task.title.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm) ||
            task.assignedToName?.toLowerCase().includes(searchTerm)
          );
        });
      }

      if (filters.status !== "all") {
        filteredData = filteredData.filter((task) => task.status === filters.status);
      }

      if (filters.priority !== "all") {
        filteredData = filteredData.filter((task) => task.priority === filters.priority);
      }

      if (filters.assignedTo) {
        filteredData = filteredData.filter((task) => task.assignedTo === filters.assignedTo);
      }

      setTasks(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError("Failed to load tasks. Please try again.");
      showSnackbar("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLeads(mockLeads);
    } catch (error) {
      showSnackbar("Failed to load leads", "error");
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
      status: "all",
      priority: "all",
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
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => t.id));
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Action menu handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedTaskForMenu(null);
  };

  const handleViewAction = () => {
    if (selectedTaskForMenu) {
      setViewingTask(selectedTaskForMenu);
      setDialogs((prev) => ({ ...prev, view: true }));
    }
    handleActionClose();
  };

  const handleEditAction = () => {
    if (selectedTaskForMenu) {
      openEditDialog(selectedTaskForMenu);
    }
    handleActionClose();
  };

  const handleDeleteAction = () => {
    if (selectedTaskForMenu) {
      setViewingTask(selectedTaskForMenu);
      setDialogs((prev) => ({ ...prev, delete: true }));
    }
    handleActionClose();
  };

  const handleCompleteAction = () => {
    if (selectedTaskForMenu) {
      setViewingTask(selectedTaskForMenu);
      setDialogs((prev) => ({ ...prev, complete: true }));
    }
    handleActionClose();
  };

  // CRUD operations
  const handleCreateTask = async () => {
    try {
      setFormErrors({});
      if (!formData.title.trim()) {
        setFormErrors({ title: "Title is required" });
        return;
      }

      const newTask: Task = {
        id: Date.now().toString(),
        leadId: formData.leadId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: "pending",
        assignedTo: formData.assignedTo,
        assignedToName: agents.find(a => a.id === formData.assignedTo)?.name,
        createdDate: new Date().toISOString(),
        createdByName: "Current User",
        reminderDate: formData.reminderDate,
      };

      showSnackbar("Task created successfully", "success");
      setDialogs((prev) => ({ ...prev, create: false }));
      setFormData({
        leadId: "",
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
        assignedTo: "",
      });
      loadTasks();
      onTasksChange?.();
    } catch (error) {
      showSnackbar("Failed to create task", "error");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      setFormErrors({});
      if (!formData.title.trim()) {
        setFormErrors({ title: "Title is required" });
        return;
      }

      showSnackbar("Task updated successfully", "success");
      setDialogs((prev) => ({ ...prev, edit: false }));
      setEditingTask(null);
      setFormData({
        leadId: "",
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
        assignedTo: "",
      });
      loadTasks();
      onTasksChange?.();
    } catch (error) {
      showSnackbar("Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      showSnackbar("Task deleted successfully", "success");
      setDialogs((prev) => ({ ...prev, delete: false }));
      loadTasks();
      onTasksChange?.();
    } catch (error) {
      showSnackbar("Failed to delete task", "error");
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      showSnackbar("Task marked as completed", "success");
      setDialogs((prev) => ({ ...prev, complete: false }));
      loadTasks();
      onTasksChange?.();
    } catch (error) {
      showSnackbar("Failed to complete task", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      showSnackbar(
        `${selectedTasks.length} tasks deleted successfully`,
        "success",
      );
      setSelectedTasks([]);
      setDialogs((prev) => ({ ...prev, bulkDelete: false }));
      loadTasks();
      onTasksChange?.();
    } catch (error) {
      showSnackbar("Failed to delete tasks", "error");
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      leadId: task.leadId,
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate.split("T")[0],
      priority: task.priority,
      assignedTo: task.assignedTo,
      reminderDate: task.reminderDate?.split("T")[0],
    });
    setFormErrors({});
    setDialogs((prev) => ({ ...prev, edit: true }));
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280";
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#6b7280";
  };

  const isOverdue = (task: Task) => {
    return task.status !== "completed" && isAfter(new Date(), new Date(task.dueDate));
  };

  // Quick filter options
  const quickFilters = [
    { label: "All Tasks", status: "all" as const },
    { label: "Pending", status: "pending" as const },
    { label: "In Progress", status: "in_progress" as const },
    { label: "Completed", status: "completed" as const },
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
                        key={filter.status}
                        onClick={() => handleFilterChange("status", filter.status)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                          filters.status === filter.status
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
                    placeholder="Search tasks..."
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

                {/* Priority Filter */}
                <FormControl size="small" className="min-w-[100px]">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    label="Priority"
                    className="bg-white"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>

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
                      leadId: "",
                      title: "",
                      description: "",
                      dueDate: new Date().toISOString().split("T")[0],
                      priority: "medium",
                      assignedTo: "",
                    });
                    setFormErrors({});
                    setDialogs((prev) => ({ ...prev, create: true }));
                  }}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  Add Task
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon style={{ fontSize: '16px' }} />}
                  onClick={loadTasks}
                  disabled={loading}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon style={{ fontSize: '16px' }} />}
                  disabled={tasks.length === 0}
                  size="small"
                  className="whitespace-nowrap"
                >
                  Export
                </Button>

                {selectedTasks.length > 0 && (
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
                    Delete ({selectedTasks.length})
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
                        tasks.length > 0 &&
                        selectedTasks.length === tasks.length
                      }
                      indeterminate={
                        selectedTasks.length > 0 &&
                        selectedTasks.length < tasks.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "title"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("title")}
                      className="font-semibold text-gray-700"
                    >
                      Task
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Lead</TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "priority"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("priority")}
                      className="font-semibold text-gray-700"
                    >
                      Priority
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">Assigned To</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sortBy === "due_date"}
                      direction={filters.sortOrder}
                      onClick={() => handleSort("due_date")}
                      className="font-semibold text-gray-700"
                    >
                      Due Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => {
                  const lead = leads.find(l => l.id === task.leadId);
                  const taskOverdue = isOverdue(task);
                  
                  return (
                    <TableRow
                      key={task.id}
                      selected={selectedTasks.includes(task.id)}
                      hover
                      className={`hover:bg-gray-50 ${taskOverdue ? 'bg-red-50' : ''}`}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500">
                              {task.description.length > 50 
                                ? `${task.description.substring(0, 50)}...`
                                : task.description
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {lead.data.fullName || lead.phoneNumber}
                            </div>
                            <div className="text-sm text-gray-500">{lead.campaignName}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Lead not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            task.status.replace("_", " ").charAt(0).toUpperCase() +
                            task.status.replace("_", " ").slice(1)
                          }
                          size="small"
                          style={{
                            backgroundColor: getStatusColor(task.status) + "20",
                            color: getStatusColor(task.status),
                            border: `1px solid ${getStatusColor(task.status)}40`,
                          }}
                          icon={
                            task.status === "completed" ? (
                              <CheckCircleIcon style={{ fontSize: '14px' }} />
                            ) : task.status === "in_progress" ? (
                              <PlayArrowIcon style={{ fontSize: '14px' }} />
                            ) : task.status === "pending" ? (
                              <ScheduleIcon style={{ fontSize: '14px' }} />
                            ) : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          size="small"
                          variant="outlined"
                          style={{
                            borderColor: getPriorityColor(task.priority),
                            color: getPriorityColor(task.priority),
                          }}
                          icon={<FlagIcon style={{ fontSize: '14px' }} />}
                        />
                      </TableCell>
                      <TableCell>
                        {task.assignedToName ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              sx={{ width: 24, height: 24, fontSize: '12px' }}
                              style={{ backgroundColor: "#3b82f6" }}
                            >
                              {task.assignedToName.charAt(0)}
                            </Avatar>
                            <span className="text-sm text-gray-700">{task.assignedToName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Typography 
                            variant="body2" 
                            className={`${taskOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}
                          >
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Typography>
                          {taskOverdue && (
                            <Typography variant="caption" className="text-red-500">
                              Overdue
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, task)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tasks.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12">
                      <div className="text-center">
                        <AssignmentIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="body1" className="text-gray-500 mb-2">
                          No tasks found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Get started by creating your first task
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
          {selectedTaskForMenu?.status !== "completed" && (
            <MenuItem onClick={handleCompleteAction} className="hover:bg-gray-50">
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" className="text-green-600" />
              </ListItemIcon>
              <ListItemText>Mark Complete</ListItemText>
            </MenuItem>
          )}
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
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              className="mb-4"
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mb-4"
            />
            <FormControl fullWidth margin="dense" className="mb-4">
              <InputLabel>Lead</InputLabel>
              <Select
                value={formData.leadId}
                label="Lead"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, leadId: e.target.value }))
                }
              >
                {leads.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.data.fullName || lead.phoneNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value as any }))
                    }
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
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
            <TextField
              margin="dense"
              label="Due Date"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, create: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask} variant="contained">
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
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              className="mb-4"
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mb-4"
            />
            <FormControl fullWidth margin="dense" className="mb-4">
              <InputLabel>Lead</InputLabel>
              <Select
                value={formData.leadId}
                label="Lead"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, leadId: e.target.value }))
                }
              >
                {leads.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.data.fullName || lead.phoneNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value as any }))
                    }
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
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
            <TextField
              margin="dense"
              label="Due Date"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, edit: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} variant="contained">
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
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent>
            {viewingTask && (
              <Stack spacing={3}>
                <TextField
                  label="Title"
                  value={viewingTask.title}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Description"
                  value={viewingTask.description || "No description"}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  value={viewingTask.status}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Priority"
                  value={viewingTask.priority}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Due Date"
                  value={
                    viewingTask.dueDate
                      ? format(new Date(viewingTask.dueDate), "PPP")
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
            {viewingTask && (
              <Button
                onClick={() => openEditDialog(viewingTask)}
                variant="contained"
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog
          open={dialogs.complete}
          onClose={() => setDialogs((prev) => ({ ...prev, complete: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Complete Task</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to mark "{viewingTask?.title}" as completed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogs((prev) => ({ ...prev, complete: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={() => viewingTask && handleCompleteTask(viewingTask)}
              color="success"
              variant="contained"
            >
              Mark Complete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={dialogs.delete}
          onClose={() => setDialogs((prev) => ({ ...prev, delete: false }))}
        >
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{viewingTask?.title}"? This action
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
              onClick={() => viewingTask && handleDeleteTask(viewingTask)}
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
          <DialogTitle>Delete Selected Tasks</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedTasks.length} selected
              tasks? This action cannot be undone.
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
              Delete {selectedTasks.length} Tasks
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

export default TaskManagementStandardized;
