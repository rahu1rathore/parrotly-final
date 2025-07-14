import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Assessment as AnalyticsIcon,
  PlayArrow as TestIcon,
  SmartToy as BotIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Mock data
const mockFlows = [
  {
    id: "1",
    name: "Welcome Flow",
    description: "Initial greeting and onboarding flow for new users",
    status: "active",
    conversations: 1250,
    completionRate: 85.5,
    lastModified: "2024-02-01",
  },
  {
    id: "2",
    name: "Support Flow",
    description: "Customer support and FAQ handling flow",
    status: "draft",
    conversations: 890,
    completionRate: 78.2,
    lastModified: "2024-01-28",
  },
];

export default function ChatbotBuilderSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [createFlowOpen, setCreateFlowOpen] = useState(false);
  const [flows, setFlows] = useState(mockFlows);
  const [newFlow, setNewFlow] = useState({
    name: "",
    description: "",
    category: "",
  });

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveFlow = () => {
    const flow = {
      id: (flows.length + 1).toString(),
      name: newFlow.name,
      description: newFlow.description,
      status: "draft" as const,
      conversations: 0,
      completionRate: 0,
      lastModified: new Date().toISOString().split("T")[0],
    };
    setFlows([...flows, flow]);
    setCreateFlowOpen(false);
    setNewFlow({ name: "", description: "", category: "" });
  };

  const handleDeleteFlow = (flowId: string) => {
    setFlows(flows.filter((f) => f.id !== flowId));
  };

  const renderFlowCard = (flow: (typeof mockFlows)[0]) => (
    <Card key={flow.id}>
      <CardContent>
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {flow.description}
            </Typography>
          </Box>
          <Chip
            label={flow.status}
            color={flow.status === "active" ? "success" : "default"}
            size="small"
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography variant="h6" color="primary">
              {flow.conversations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conversations
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" color="success.main">
              {flow.completionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completion
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" color="info.main">
              {flow.lastModified}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Modified
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            onClick={() => alert(`Edit flow ${flow.id}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteFlow(flow.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderFlowManagement = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Conversation Flows
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage your chatbot conversation flows
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateFlowOpen(true)}
        >
          Create New Flow
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary">
                {flows.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Flows
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main">
                {flows.filter((f) => f.status === "active").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Flows
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main">
                {flows.reduce((sum, f) => sum + f.conversations, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conversations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main">
                {flows.length > 0
                  ? Math.round(
                      flows.reduce((sum, f) => sum + f.completionRate, 0) /
                        flows.length,
                    )
                  : 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flows Grid */}
      <Grid container spacing={2}>
        {flows.map((flow) => (
          <Grid item xs={12} sm={6} md={4} key={flow.id}>
            {renderFlowCard(flow)}
          </Grid>
        ))}
      </Grid>

      {flows.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No chatbot flows created yet. Create your first flow to get started!
        </Alert>
      )}
    </Box>
  );

  const renderAnalytics = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              {flows.map((flow) => (
                <Box key={flow.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {flow.name}: {flow.completionRate}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AnalyticsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Peak Usage"
                    secondary="Most conversations happen between 9 AM - 5 PM"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChatIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Flow Effectiveness"
                    secondary="Sales flows have the highest completion rates"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTesting = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Flow Testing
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interactive Testing
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Test your flows in real-time with our chat simulator
              </Typography>
              <Button variant="contained" startIcon={<TestIcon />}>
                Start Test Session
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Automated Testing
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Run comprehensive test suites on your flows
              </Typography>
              <Stack spacing={1}>
                <Button variant="outlined" size="small">
                  Unit Tests
                </Button>
                <Button variant="outlined" size="small">
                  Integration Tests
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🤖 Chatbot Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Build sophisticated conversational experiences with our visual flow
          editor
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="Flow Management"
            icon={<ChatIcon />}
            iconPosition="start"
          />
          <Tab
            label="Analytics"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab label="Testing" icon={<TestIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderFlowManagement()}
        {activeTab === 1 && renderAnalytics()}
        {activeTab === 2 && renderTesting()}
      </Box>

      {/* Create Flow Dialog */}
      <Dialog
        open={createFlowOpen}
        onClose={() => setCreateFlowOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Chatbot Flow</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Flow Name"
              value={newFlow.name}
              onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
              placeholder="e.g., Customer Support Flow"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newFlow.description}
              onChange={(e) =>
                setNewFlow({ ...newFlow, description: e.target.value })
              }
              placeholder="Describe what this flow will do..."
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newFlow.category}
                label="Category"
                onChange={(e) =>
                  setNewFlow({ ...newFlow, category: e.target.value })
                }
              >
                <MenuItem value="onboarding">Onboarding</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFlowOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveFlow}
            variant="contained"
            disabled={!newFlow.name || !newFlow.description}
          >
            Create Flow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
