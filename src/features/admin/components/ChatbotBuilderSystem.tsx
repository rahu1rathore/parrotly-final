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
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Assessment as AnalyticsIcon,
  PlayArrow as TestIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";

export default function ChatbotBuilderSystem() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateFlow = () => {
    alert("Create Flow functionality will open the flow creation wizard");
  };

  const renderFlowManagement = () => (
    <Container maxWidth="lg">
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

              <Alert severity="info" sx={{ mb: 3 }}>
                No chatbot flows created yet. Create your first flow to get
                started with building conversational experiences.
              </Alert>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Features Available:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <BotIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Visual Flow Editor
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drag-and-drop interface with React Flow for building
                        conversation logic
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <AnalyticsIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Analytics Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track performance, user engagement, and conversation
                        success rates
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <TestIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Testing Suite
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Interactive and automated testing with debug
                        capabilities
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  const renderAnalytics = () => (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary" gutterBottom>
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
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="success.main" gutterBottom>
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
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="info.main" gutterBottom>
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
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="warning.main" gutterBottom>
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Alert severity="info">
                Detailed analytics and insights will be available once you
                create and publish your first chatbot flow.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  const renderTesting = () => (
    <Container maxWidth="lg">
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Flow Testing Interface
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Interactive testing interface will be available once you create your
            first flow.
          </Alert>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Testing Features:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TestIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Interactive Testing"
                secondary="Test your flows in real-time with a chat interface"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TestIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Automated Testing"
                secondary="Run automated test suites to validate flow logic"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TestIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Performance Testing"
                secondary="Monitor response times and conversation quality"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );

  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}
    >
      {/* Header */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🤖 Chatbot Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage conversational flows for your chatbot using our
            visual flow builder
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label="Flow Management"
              icon={<ChatIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Analytics"
              icon={<AnalyticsIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Testing"
              icon={<TestIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderFlowManagement()}
          {activeTab === 1 && renderAnalytics()}
          {activeTab === 2 && renderTesting()}
        </Box>

        {/* Coming Soon Features */}
        <Box sx={{ mt: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Upcoming Features
              </Typography>
              <Grid container spacing={1}>
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
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Chip
                      label={feature}
                      variant="outlined"
                      color="primary"
                      sx={{
                        width: "100%",
                        justifyContent: "flex-start",
                        height: "auto",
                        py: 1,
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                          textAlign: "left",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
