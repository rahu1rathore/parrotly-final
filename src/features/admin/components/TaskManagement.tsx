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
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  NotificationImportant as ReminderIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Task, TaskFormData, Lead, Agent } from "../types";

interface TaskManagementProps {
  tasks: Task[];
  leads: Lead[];
  agents: Agent[];
  loading?: boolean;
  onCreateTask: (data: TaskFormData) => void;
  onUpdateTask: (
    id: string,
    data: Partial<TaskFormData & { status: Task["status"]; outcome?: string }>,
  ) => void;
  onDeleteTask: (id: string) => void;
  onRefresh?: () => void;
}

const STATUS_COLORS = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "error",
} as const;

const PRIORITY_COLORS = {
  low: "default",
  medium: "warning",
  high: "error",
} as const;

const TAB_FILTERS = {
  all: () => true,
  pending: (task: Task) => task.status === "pending",
  in_progress: (task: Task) => task.status === "in_progress",
  overdue: (task: Task) =>
    task.status !== "completed" && isAfter(new Date(), new Date(task.dueDate)),
  today: (task: Task) => {
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  },
  upcoming: (task: Task) => {
    const tomorrow = addDays(new Date(), 1);
    const weekFromNow = addDays(new Date(), 7);
    const taskDate = new Date(task.dueDate);
    return isAfter(taskDate, tomorrow) && isBefore(taskDate, weekFromNow);
  },
};

export default function TaskManagement({
  tasks,
  leads,
  agents,
  loading = false,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onRefresh,
}: TaskManagementProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<TaskFormData>({
    leadId: "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    assignedTo: "",
  });

  const [completionData, setCompletionData] = useState({
    outcome: "",
    updateLeadStatus: false,
    newLeadStatus: "contacted" as Lead["status"],
  });

  const tabLabels = [
    "All",
    "Pending",
    "In Progress",
    "Overdue",
    "Today",
    "Upcoming",
  ];
  const tabFilters = Object.values(TAB_FILTERS);

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = tabFilters[currentTab](task);

    return matchesSearch && matchesTab;
  });

  // Paginate tasks
  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    if (selectedTask) {
      setEditingTask(selectedTask);
      setFormData({
        leadId: selectedTask.leadId,
        title: selectedTask.title,
        description: selectedTask.description || "",
        dueDate: selectedTask.dueDate.split("T")[0],
        reminderDate: selectedTask.reminderDate?.split("T")[0],
        priority: selectedTask.priority,
        assignedTo: selectedTask.assignedTo,
      });
      setFormDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTask) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleMarkComplete = () => {
    if (selectedTask) {
      setCompleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleMarkInProgress = () => {
    if (selectedTask) {
      onUpdateTask(selectedTask.id, { status: "in_progress" });
    }
    handleMenuClose();
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setFormData({
      leadId: "",
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      assignedTo: "",
    });
    setFormDialogOpen(true);
  };

  const handleFormSubmit = () => {
    if (editingTask) {
      onUpdateTask(editingTask.id, formData);
    } else {
      onCreateTask(formData);
    }
    setFormDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id);
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    }
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      const updateData: any = {
        status: "completed" as Task["status"],
        outcome: completionData.outcome,
      };

      onUpdateTask(selectedTask.id, updateData);

      // If updating lead status, handle that separately
      if (completionData.updateLeadStatus) {
        // This would typically call a lead update API
        console.log("Update lead status to:", completionData.newLeadStatus);
      }

      setCompleteDialogOpen(false);
      setCompletionData({
        outcome: "",
        updateLeadStatus: false,
        newLeadStatus: "contacted",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      leadId: "",
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      assignedTo: "",
    });
    setEditingTask(null);
  };

  const renderStatusChip = (status: Task["status"]) => (
    <Chip
      label={
        status.replace("_", " ").charAt(0).toUpperCase() +
        status.replace("_", " ").slice(1)
      }
      color={STATUS_COLORS[status]}
      size="small"
      variant="filled"
      icon={
        status === "completed" ? (
          <CheckCircleIcon />
        ) : status === "in_progress" ? (
          <PlayArrowIcon />
        ) : status === "pending" ? (
          <ScheduleIcon />
        ) : status === "cancelled" ? (
          <Pause />
        ) : undefined
      }
    />
  );

  const renderPriorityChip = (priority: Task["priority"]) => (
    <Chip
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      color={PRIORITY_COLORS[priority]}
      size="small"
      variant="outlined"
      icon={<FlagIcon />}
    />
  );

  const isOverdue = (task: Task) => {
    return (
      task.status !== "completed" && isAfter(new Date(), new Date(task.dueDate))
    );
  };

  const getDueDateColor = (task: Task) => {
    if (task.status === "completed") return "text.secondary";
    if (isOverdue(task)) return "error.main";
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    if (taskDate.toDateString() === today.toDateString()) return "warning.main";
    return "text.primary";
  };

  const renderTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
    };

    const statsCards = [
      {
        title: "Total Tasks",
        value: stats.total,
        icon: <AssignmentIcon />,
        color: "#2196f3",
      },
      {
        title: "Pending",
        value: stats.pending,
        icon: <ScheduleIcon />,
        color: "#ff9800",
      },
      {
        title: "In Progress",
        value: stats.inProgress,
        icon: <PlayArrowIcon />,
        color: "#2196f3",
      },
      {
        title: "Completed",
        value: stats.completed,
        icon: <CheckCircleIcon />,
        color: "#4caf50",
      },
      {
        title: "Overdue",
        value: stats.overdue,
        icon: <TimeIcon />,
        color: "#f44336",
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Avatar sx={{ bgcolor: card.color, mx: "auto", mb: 1 }}>
                  {card.icon}
                </Avatar>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Task Statistics */}
      {renderTaskStats()}

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
            Task Management ({filteredTasks.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create Task
          </Button>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => {
            const count = tasks.filter(tabFilters[index]).length;
            return (
              <Tab
                key={label}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {label}
                    <Badge badgeContent={count} color="primary" />
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Tasks Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Loading tasks...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>
                      {filteredTasks.length === 0 && tasks.length > 0
                        ? "No tasks match your search criteria"
                        : "No tasks found. Create your first task to get started."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => {
                  const lead = leads.find((l) => l.id === task.leadId);
                  const isTaskOverdue = isOverdue(task);

                  return (
                    <TableRow
                      key={task.id}
                      hover
                      sx={{
                        backgroundColor: isTaskOverdue
                          ? "rgba(244, 67, 54, 0.05)"
                          : "inherit",
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500 }}
                          >
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary">
                              {task.description.length > 60
                                ? `${task.description.substring(0, 60)}...`
                                : task.description}
                            </Typography>
                          )}
                          {task.reminderDate && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <ReminderIcon
                                sx={{
                                  fontSize: 16,
                                  mr: 0.5,
                                  color: "warning.main",
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="warning.main"
                              >
                                Reminder:{" "}
                                {format(
                                  new Date(task.reminderDate),
                                  "MMM dd, hh:mm a",
                                )}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        {lead ? (
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {lead.data.fullName || lead.phoneNumber}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {lead.campaignName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Lead not found
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{ width: 32, height: 32, mr: 1, fontSize: 14 }}
                          >
                            {task.assignedToName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">
                            {task.assignedToName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>{renderPriorityChip(task.priority)}</TableCell>

                      <TableCell>{renderStatusChip(task.status)}</TableCell>

                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: getDueDateColor(task),
                              fontWeight: isTaskOverdue ? "bold" : "normal",
                            }}
                          >
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(task.dueDate), "hh:mm a")}
                          </Typography>
                          {isTaskOverdue && (
                            <Typography
                              variant="caption"
                              color="error"
                              display="block"
                            >
                              Overdue
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(task.createdDate), "MMM dd, yyyy")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {task.createdByName}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, task)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTasks.length}
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
        {selectedTask?.status === "pending" && (
          <MenuItem onClick={handleMarkInProgress}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            Mark In Progress
          </MenuItem>
        )}
        {(selectedTask?.status === "pending" ||
          selectedTask?.status === "in_progress") && (
          <MenuItem onClick={handleMarkComplete}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Task
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Task
        </MenuItem>
      </Menu>

      {/* Task Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Lead</InputLabel>
                <Select
                  value={formData.leadId}
                  label="Select Lead"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leadId: e.target.value }))
                  }
                  required
                >
                  {leads.map((lead) => (
                    <MenuItem key={lead.id} value={lead.id}>
                      <Box>
                        <Typography variant="body2">
                          {lead.data.fullName || lead.phoneNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lead.campaignName} • {lead.status}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                label="Due Date"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reminder Date"
                type="datetime-local"
                value={formData.reminderDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reminderDate: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  label="Assign To"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  required
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      <Box>
                        <Typography variant="body2">{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.assignedLeadsCount} assigned leads
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={
              !formData.leadId || !formData.title.trim() || !formData.assignedTo
            }
          >
            {editingTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Completion Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Task</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Mark task "{selectedTask?.title}" as completed.
          </Typography>

          <TextField
            fullWidth
            label="Task Outcome"
            multiline
            rows={3}
            value={completionData.outcome}
            onChange={(e) =>
              setCompletionData((prev) => ({
                ...prev,
                outcome: e.target.value,
              }))
            }
            placeholder="Describe the outcome of this task..."
            sx={{ mt: 2, mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={completionData.updateLeadStatus}
                onChange={(e) =>
                  setCompletionData((prev) => ({
                    ...prev,
                    updateLeadStatus: e.target.checked,
                  }))
                }
              />
              <span style={{ marginLeft: 8 }}>
                Update lead status based on task outcome
              </span>
            </label>
          </FormControl>

          {completionData.updateLeadStatus && (
            <FormControl fullWidth>
              <InputLabel>New Lead Status</InputLabel>
              <Select
                value={completionData.newLeadStatus}
                label="New Lead Status"
                onChange={(e) =>
                  setCompletionData((prev) => ({
                    ...prev,
                    newLeadStatus: e.target.value as Lead["status"],
                  }))
                }
              >
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="dropped">Dropped</MenuItem>
                <MenuItem value="nurturing">Nurturing</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCompleteTask}
            variant="contained"
            color="success"
          >
            Complete Task
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
            Are you sure you want to delete the task "{selectedTask?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
