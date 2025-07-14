import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Publish as PublishIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  Assessment as AnalyticsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ActiveIcon,
  RadioButtonUnchecked as InactiveIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  ChatbotFlow,
  ChatbotFlowFormData,
  ChatbotFlowNode,
  ChatbotFlowEdge,
  ChatbotFilter,
  ChatbotFlowStats,
} from "../types";
import { chatbotFlowAPI } from "../services/api";
import ChatbotFlowCreator from "./ChatbotFlowCreator";
import ChatbotFlowEditor from "./ChatbotFlowEditor";
import ChatbotAnalyticsDashboard from "./ChatbotAnalyticsDashboard";
import ChatbotTestingInterface from "./ChatbotTestingInterface";

type ViewMode = "list" | "create" | "edit";

export default function ChatbotBuilderSystem() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [flows, setFlows] = useState<ChatbotFlow[]>([]);
  const [stats, setStats] = useState<ChatbotFlowStats | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<ChatbotFlow | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFlowForMenu, setSelectedFlowForMenu] =
    useState<ChatbotFlow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ChatbotFilter>({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadFlows();
    loadStats();
  }, [filter]);

  const loadFlows = async () => {
    try {
      setLoading(true);
      const response = await chatbotFlowAPI.getAll(filter);
      setFlows(response.data);
    } catch (error) {
      console.error("Failed to load flows:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await chatbotFlowAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreateFlow = async (data: ChatbotFlowFormData) => {
    try {
      setCreating(true);
      const response = await chatbotFlowAPI.create(data);
      setSelectedFlow(response.data);
      setViewMode("edit");
      await loadFlows();
      await loadStats();
    } catch (error) {
      console.error("Failed to create flow:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditFlow = (flow: ChatbotFlow) => {
    setSelectedFlow(flow);
    setViewMode("edit");
  };

  const handleSaveFlow = async (
    nodes: ChatbotFlowNode[],
    edges: ChatbotFlowEdge[],
  ) => {
    if (!selectedFlow) return;

    try {
      await chatbotFlowAPI.updateStructure(selectedFlow.id, nodes, edges);
      await loadFlows();
    } catch (error) {
      console.error("Failed to save flow:", error);
    }
  };

  const handlePublishFlow = async () => {
    if (!selectedFlow) return;

    try {
      await chatbotFlowAPI.publish(selectedFlow.id);
      await loadFlows();
      await loadStats();
    } catch (error) {
      console.error("Failed to publish flow:", error);
    }
  };

  const handleDeleteFlow = async () => {
    if (!flowToDelete) return;

    try {
      await chatbotFlowAPI.delete(flowToDelete.id);
      await loadFlows();
      await loadStats();
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
    } catch (error) {
      console.error("Failed to delete flow:", error);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    flow: ChatbotFlow,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedFlowForMenu(flow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFlowForMenu(null);
  };

  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.total_flows}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Flows
                  </Typography>
                </Box>
                <ChatIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.active_flows}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Flows
                  </Typography>
                </Box>
                <ActiveIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats.total_conversations.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Conversations
                  </Typography>
                </Box>
                <PeopleIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.average_completion_rate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Completion Rate
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFlowCard = (flow: ChatbotFlow) => (
    <Card
      key={flow.id}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {flow.name}
            </Typography>
            {flow.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {flow.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={flow.is_active ? "Active" : "Draft"}
              color={flow.is_active ? "success" : "default"}
              size="small"
            />
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, flow)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {flow.category && (
            <Chip label={flow.category} size="small" variant="outlined" />
          )}
          {flow.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          {flow.tags.length > 3 && (
            <Chip
              label={`+${flow.tags.length - 3}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="primary">
              {flow.total_conversations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conversations
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              {flow.completion_rate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completion
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="info.main">
              {flow.average_completion_time}s
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Time
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Created {format(new Date(flow.created_date), "MMM dd, yyyy")} by{" "}
          {flow.created_by_name}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={() => handleEditFlow(flow)}
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<TestIcon />}
          onClick={() => setActiveTab(2)}
        >
          Test
        </Button>
        <Button
          size="small"
          startIcon={<AnalyticsIcon />}
          onClick={() => setActiveTab(1)}
        >
          Analytics
        </Button>
      </CardActions>
    </Card>
  );

  const renderTopPerformers = () => {
    if (!stats?.top_performing_flows.length) return null;

    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Performing Flows
          </Typography>
          <List>
            {stats.top_performing_flows.map((flow, index) => (
              <React.Fragment key={flow.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor:
                          index === 0
                            ? "gold"
                            : index === 1
                              ? "silver"
                              : "#cd7f32",
                        width: 32,
                        height: 32,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={flow.name}
                    secondary={`${flow.completion_rate}% completion • ${flow.total_conversations} conversations`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={`${flow.completion_rate}%`}
                      color="success"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < stats.top_performing_flows.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  if (viewMode === "create") {
    return (
      <ChatbotFlowCreator
        onSubmit={handleCreateFlow}
        onCancel={() => setViewMode("list")}
        loading={creating}
      />
    );
  }

  if (viewMode === "edit" && selectedFlow) {
    return (
      <ChatbotFlowEditor
        flow={selectedFlow}
        onSave={handleSaveFlow}
        onPublish={handlePublishFlow}
        onBack={() => setViewMode("list")}
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Chatbot Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage conversational flows for your chatbot
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setViewMode("create")}
          size="large"
        >
          Create New Flow
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Flow Management" icon={<ChatIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
          <Tab label="Testing" icon={<TestIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Statistics Cards */}
          {renderStatsCards()}

          {/* Search and Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                placeholder="Search flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter.status || ""}
                  label="Status"
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filter.category || ""}
                  label="Category"
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              {loading ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography>Loading flows...</Typography>
                </Box>
              ) : filteredFlows.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: "center" }}>
                  <ChatIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {flows.length === 0
                      ? "No flows created yet"
                      : "No flows match your search"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {flows.length === 0
                      ? "Create your first chatbot flow to get started"
                      : "Try adjusting your search terms or filters"}
                  </Typography>
                  {flows.length === 0 && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setViewMode("create")}
                    >
                      Create Your First Flow
                    </Button>
                  )}
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredFlows.map((flow) => (
                    <Grid item xs={12} md={6} key={flow.id}>
                      {renderFlowCard(flow)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              {renderTopPerformers()}

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <List>
                    <ListItem
                      sx={{ cursor: "pointer" }}
                      onClick={() => setViewMode("create")}
                    >
                      <ListItemIcon>
                        <AddIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Create New Flow"
                        secondary="Start building a new conversation"
                      />
                    </ListItem>
                    <ListItem
                      sx={{ cursor: "pointer" }}
                      onClick={() => setActiveTab(1)}
                    >
                      <ListItemIcon>
                        <AnalyticsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="View Analytics"
                        secondary="Detailed performance metrics"
                      />
                    </ListItem>
                    <ListItem
                      sx={{ cursor: "pointer" }}
                      onClick={() => setActiveTab(2)}
                    >
                      <ListItemIcon>
                        <TestIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Test Flows"
                        secondary="Interactive and automated testing"
                      />
                    </ListItem>
                    <ListItem sx={{ cursor: "pointer" }}>
                      <ListItemIcon>
                        <ExportIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Export Flows"
                        secondary="Download all flows as JSON"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 1 && <ChatbotAnalyticsDashboard flows={flows} />}

      {activeTab === 2 && <ChatbotTestingInterface flows={flows} />}

      {/* Flow Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleEditFlow(selectedFlowForMenu!);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit Flow
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          Preview
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ExportIcon />
          </ListItemIcon>
          Export
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setFlowToDelete(selectedFlowForMenu);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Flow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{flowToDelete?.name}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFlow} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
        }}
        onClick={() => setViewMode("create")}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
