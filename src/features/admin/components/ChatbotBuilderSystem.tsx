import { useState } from "react";
import {
  Box,
  Container,
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
  Divider,
  LinearProgress,
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
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  GetApp as ExportIcon,
  CloudUpload as ImportIcon,
  Timeline as FlowIcon,
  Code as CodeIcon,
  Language as TranslateIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Group as CollabIcon,
} from "@mui/icons-material";

// Mock data for demonstration
const mockFlows = [
  {
    id: "1",
    name: "Welcome Flow",
    description: "Initial greeting and onboarding flow for new users",
    status: "active",
    conversations: 1250,
    completionRate: 85.5,
    lastModified: "2024-02-01",
    category: "onboarding",
  },
  {
    id: "2",
    name: "Support Flow",
    description: "Customer support and FAQ handling flow",
    status: "draft",
    conversations: 890,
    completionRate: 78.2,
    lastModified: "2024-01-28",
    category: "support",
  },
  {
    id: "3",
    name: "Sales Flow",
    description: "Product inquiry and sales conversion flow",
    status: "active",
    conversations: 2100,
    completionRate: 92.1,
    lastModified: "2024-02-02",
    category: "sales",
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
    keywords: "",
    access: "public",
  });

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateFlow = () => {
    setCreateFlowOpen(true);
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
      category: newFlow.category,
    };
    setFlows([...flows, flow]);
    setCreateFlowOpen(false);
    setNewFlow({
      name: "",
      description: "",
      category: "",
      keywords: "",
      access: "public",
    });
  };

  const handleEditFlow = (flowId: string) => {
    alert(`Opening flow editor for flow ${flowId}`);
  };

  const handleDeleteFlow = (flowId: string) => {
    setFlows(flows.filter((f) => f.id !== flowId));
  };

  const renderCreateFlowDialog = () => (
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
          <TextField
            fullWidth
            label="Trigger Keywords"
            value={newFlow.keywords}
            onChange={(e) =>
              setNewFlow({ ...newFlow, keywords: e.target.value })
            }
            placeholder="hello, help, start (comma separated)"
            helperText="Keywords that will trigger this flow"
          />
          <FormControl fullWidth>
            <InputLabel>Access Level</InputLabel>
            <Select
              value={newFlow.access}
              label="Access Level"
              onChange={(e) =>
                setNewFlow({ ...newFlow, access: e.target.value })
              }
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="role-based">Role-based</MenuItem>
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
  );

  const renderFlowCard = (flow: (typeof mockFlows)[0]) => (
    <Card key={flow.id} sx={{ height: "100%" }}>
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

        <Divider sx={{ my: 2 }} />

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
          <IconButton size="small" onClick={() => handleEditFlow(flow.id)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small">
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteFlow(flow.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderFlowManagement = () => (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
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
              onClick={handleCreateFlow}
              size="large"
            >
              Create New Flow
            </Button>
          </Box>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary">
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
              <Typography variant="h3" color="success.main">
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
              <Typography variant="h3" color="info.main">
                {flows.reduce((sum, f) => sum + f.conversations, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Conversations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="warning.main">
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

        {/* Flows Grid */}
        {flows.map((flow) => (
          <Grid item xs={12} sm={6} md={4} key={flow.id}>
            {renderFlowCard(flow)}
          </Grid>
        ))}

        {flows.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No chatbot flows created yet. Create your first flow to get
              started!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Container>
  );

  const renderAnalytics = () => (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              {flows.map((flow) => (
                <Box key={flow.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{flow.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {flow.completionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={flow.completionRate}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Flows */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Active Flows
              </Typography>
              <List>
                {flows
                  .sort((a, b) => b.conversations - a.conversations)
                  .slice(0, 5)
                  .map((flow, index) => (
                    <ListItem key={flow.id} divider={index < 4}>
                      <ListItemText
                        primary={flow.name}
                        secondary={`${flow.conversations} conversations • ${flow.completionRate}% completion`}
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
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
                    <SpeedIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Average Response Time"
                    secondary="Users respond within 30 seconds on average"
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
    </Container>
  );

  const renderTesting = () => (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interactive Testing
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Test your flows in real-time with our chat simulator
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button variant="contained" startIcon={<TestIcon />}>
                  Start Test Session
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />}>
                  Test Settings
                </Button>
              </Box>
              <Alert severity="info">
                Select a flow from the dropdown to begin testing
              </Alert>
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
              <Stack spacing={2}>
                <Button variant="outlined" fullWidth>
                  Unit Tests
                </Button>
                <Button variant="outlined" fullWidth>
                  Integration Tests
                </Button>
                <Button variant="outlined" fullWidth>
                  User Journey Tests
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent test results will appear here once you run tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
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

        {/* Feature Highlights */}
        <Card
          sx={{
            mb: 4,
            bgcolor: "primary.50",
            borderLeft: 4,
            borderColor: "primary.main",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              ✨ Scalable Rule-Based Chatbot Builder
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FlowIcon color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    Visual Flow Editor
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CodeIcon color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    Multiple Node Types
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TestIcon color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    Advanced Testing
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }} elevation={1}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              label="Flow Management"
              icon={<ChatIcon />}
              iconPosition="start"
              sx={{ minHeight: 72, textTransform: "none", fontSize: "1rem" }}
            />
            <Tab
              label="Analytics"
              icon={<AnalyticsIcon />}
              iconPosition="start"
              sx={{ minHeight: 72, textTransform: "none", fontSize: "1rem" }}
            />
            <Tab
              label="Testing"
              icon={<TestIcon />}
              iconPosition="start"
              sx={{ minHeight: 72, textTransform: "none", fontSize: "1rem" }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderFlowManagement()}
          {activeTab === 1 && renderAnalytics()}
          {activeTab === 2 && renderTesting()}
        </Box>

        {/* Additional Features Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            🚀 Advanced Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <TranslateIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Multi-Language
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Support for multiple languages and localization
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Role-Based Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Secure access control and permissions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <CollabIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Collaboration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team collaboration and version control
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <ExportIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant={'h6" gutterBottom'}>
                    Export/Import
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Backup and share your flows easily
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Create Flow Dialog */}
      {renderCreateFlowDialog()}
    </Box>
  );
}
