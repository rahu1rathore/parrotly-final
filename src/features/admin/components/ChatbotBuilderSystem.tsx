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
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Assessment as AnalyticsIcon,
  PlayArrow as TestIcon,
} from "@mui/icons-material";

export default function ChatbotBuilderSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [flows] = useState([]);

  const renderFlowManagement = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5">Conversation Flows</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    alert("Create flow functionality coming soon!")
                  }
                >
                  Create New Flow
                </Button>
              </Box>

              {flows.length === 0 ? (
                <Alert severity="info">
                  No chatbot flows created yet. Create your first flow to get
                  started with building conversational experiences.
                </Alert>
              ) : (
                <Typography>Your flows will appear here.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAnalytics = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Flows
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Flows
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conversations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Alert severity="info">
            Detailed analytics and insights will be available once you create
            and publish your first chatbot flow.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTesting = () => (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Flow Testing
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Interactive testing interface will be available once you create your
            first flow.
          </Alert>

          <List>
            <ListItem>
              <ListItemIcon>
                <TestIcon />
              </ListItemIcon>
              <ListItemText
                primary="Interactive Testing"
                secondary="Test your flows in real-time with a chat interface"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TestIcon />
              </ListItemIcon>
              <ListItemText
                primary="Automated Testing"
                secondary="Run automated test suites to validate flow logic"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TestIcon />
              </ListItemIcon>
              <ListItemText
                primary="Performance Testing"
                secondary="Monitor response times and conversation quality"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chatbot Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage conversational flows for your chatbot using our
          visual flow builder
        </Typography>
      </Box>

      {/* Features Overview */}
      <Card sx={{ mb: 4, bgcolor: "primary.50" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Scalable Rule-Based Chatbot Builder
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ChatIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body2" fontWeight="medium">
                  Visual Flow Editor
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Drag-and-drop interface with React Flow for building
                conversation logic
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AnalyticsIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body2" fontWeight="medium">
                  Advanced Analytics
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Track performance, user engagement, and conversation success
                rates
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TestIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body2" fontWeight="medium">
                  Testing Suite
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Interactive and automated testing with debug capabilities
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
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
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && renderFlowManagement()}
      {activeTab === 1 && renderAnalytics()}
      {activeTab === 2 && renderTesting()}

      {/* Coming Soon Features */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Coming Soon Features
          </Typography>
          <Grid container spacing={2}>
            {[
              "Visual Node-based Flow Editor with React Flow",
              "Multiple Node Types (Text, Button, List, Media, API)",
              "Auto-layout and Manual Arrangement",
              "Real-time Flow Testing Interface",
              "Advanced Analytics Dashboard",
              "Template System & Reusability",
              "Multi-language Support",
              "API Integration & Dynamic Content",
              "Version Control & Collaboration",
              "Export/Import Functionality",
            ].map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Chip
                  label={feature}
                  variant="outlined"
                  color="primary"
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    px: 2,
                    py: 1,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
