import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  Settings as SettingsIcon,
  CheckCircle as PassIcon,
  Error as FailIcon,
  Schedule as PendingIcon,
  BugReport as DebugIcon,
  Speed as SpeedIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  ChatbotFlow,
  ChatbotFlowNode,
  ChatbotTestResult,
  ChatbotConversation,
} from "../types";
import { chatbotTestAPI, chatbotConversationAPI } from "../services/api";

interface ChatbotTestingInterfaceProps {
  flows: ChatbotFlow[];
}

interface TestMessage {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  nodeId?: string;
  metadata?: any;
}

interface TestSession {
  id: string;
  flowId: string;
  flowName: string;
  status: "running" | "completed" | "failed" | "stopped";
  messages: TestMessage[];
  currentNodeId?: string;
  variables: Record<string, any>;
  startTime: Date;
  endTime?: Date;
}

export default function ChatbotTestingInterface({
  flows,
}: ChatbotTestingInterfaceProps) {
  const [selectedFlow, setSelectedFlow] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [testResults, setTestResults] = useState<ChatbotTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testSettings, setTestSettings] = useState({
    simulateDelay: true,
    logDebugInfo: true,
    trackVariables: true,
    maxMessages: 50,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testSession?.messages]);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    if (!selectedFlow) return;

    try {
      const response = await chatbotTestAPI.getTestHistory(selectedFlow);
      setTestResults(response.data);
    } catch (error) {
      console.error("Failed to load test history:", error);
    }
  };

  const startTestSession = () => {
    if (!selectedFlow) return;

    const flow = flows.find((f) => f.id === selectedFlow);
    if (!flow) return;

    const newSession: TestSession = {
      id: `test-${Date.now()}`,
      flowId: selectedFlow,
      flowName: flow.name,
      status: "running",
      messages: [
        {
          id: "system-start",
          type: "system",
          content: `Test session started for "${flow.name}"`,
          timestamp: new Date(),
        },
      ],
      variables: {},
      startTime: new Date(),
    };

    setTestSession(newSession);

    // Simulate initial bot message
    setTimeout(() => {
      addBotMessage("Welcome! How can I help you today?", "welcome-1");
    }, 500);
  };

  const stopTestSession = () => {
    if (!testSession) return;

    setTestSession((prev) =>
      prev
        ? {
            ...prev,
            status: "stopped",
            endTime: new Date(),
            messages: [
              ...prev.messages,
              {
                id: "system-stop",
                type: "system",
                content: "Test session stopped by user",
                timestamp: new Date(),
              },
            ],
          }
        : null,
    );
  };

  const resetTestSession = () => {
    setTestSession(null);
    setInputMessage("");
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !testSession) return;

    const userMessage: TestMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setTestSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, userMessage],
          }
        : null,
    );

    // Simulate bot response
    setTimeout(
      () => {
        simulateBotResponse(inputMessage);
      },
      testSettings.simulateDelay ? 1000 : 100,
    );

    setInputMessage("");
  };

  const simulateBotResponse = (userInput: string) => {
    // Simple simulation logic - in real implementation, this would process the flow
    const responses = [
      { content: "I understand you said: " + userInput, nodeId: "response-1" },
      { content: "What would you like to do next?", nodeId: "menu-1" },
      {
        content: "Thanks for testing! Is there anything else?",
        nodeId: "followup-1",
      },
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    addBotMessage(randomResponse.content, randomResponse.nodeId);
  };

  const addBotMessage = (content: string, nodeId?: string) => {
    const botMessage: TestMessage = {
      id: `bot-${Date.now()}`,
      type: "bot",
      content,
      timestamp: new Date(),
      nodeId,
    };

    setTestSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, botMessage],
            currentNodeId: nodeId,
          }
        : null,
    );
  };

  const runAutomatedTest = async (
    testType: "unit" | "integration" | "user_journey",
  ) => {
    if (!selectedFlow) return;

    try {
      setLoading(true);
      const response = await chatbotTestAPI.runTest(selectedFlow, testType);
      setTestResults((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error("Failed to run test:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTestChat = () => (
    <Card sx={{ height: 600, display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Test Conversation"
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            {testSession ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={stopTestSession}
                  startIcon={<StopIcon />}
                  disabled={testSession.status !== "running"}
                >
                  Stop
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetTestSession}
                  startIcon={<ResetIcon />}
                >
                  Reset
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={startTestSession}
                startIcon={<PlayIcon />}
                disabled={!selectedFlow}
              >
                Start Test
              </Button>
            )}
          </Box>
        }
      />

      <CardContent sx={{ flexGrow: 1, overflow: "hidden", p: 0 }}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            {testSession ? (
              <List>
                {testSession.messages.map((message) => (
                  <ListItem key={message.id} alignItems="flex-start">
                    <ListItemIcon>
                      {message.type === "user" ? (
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <UserIcon />
                        </Avatar>
                      ) : message.type === "bot" ? (
                        <Avatar sx={{ bgcolor: "success.main" }}>
                          <BotIcon />
                        </Avatar>
                      ) : (
                        <Avatar sx={{ bgcolor: "grey.500" }}>
                          <DebugIcon />
                        </Avatar>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          {message.nodeId && (
                            <Chip
                              label={message.nodeId}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={format(message.timestamp, "HH:mm:ss")}
                    />
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "text.secondary",
                }}
              >
                <BotIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Ready to Test</Typography>
                <Typography variant="body2">
                  Select a flow and start a test session
                </Typography>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          {testSession && testSession.status === "running" && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderAutomatedTests = () => (
    <Card>
      <CardHeader title="Automated Testing" />
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SpeedIcon />}
              onClick={() => runAutomatedTest("unit")}
              disabled={!selectedFlow || loading}
            >
              Unit Test
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => runAutomatedTest("integration")}
              disabled={!selectedFlow || loading}
            >
              Integration Test
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => runAutomatedTest("user_journey")}
              disabled={!selectedFlow || loading}
            >
              User Journey Test
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Typography variant="h6" gutterBottom>
          Test Results
        </Typography>
        {testResults.length === 0 ? (
          <Alert severity="info">
            No test results yet. Run a test to see results here.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Execution Time</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.test_name}</TableCell>
                    <TableCell>
                      <Chip label={result.test_type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {result.status === "passed" ? (
                          <PassIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <FailIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography
                          color={
                            result.status === "passed"
                              ? "success.main"
                              : "error.main"
                          }
                          fontWeight="medium"
                        >
                          {result.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <LinearProgress
                        variant="determinate"
                        value={result.success_rate}
                        sx={{ width: 80, mr: 1, display: "inline-block" }}
                        color={result.success_rate > 80 ? "success" : "warning"}
                      />
                      {result.success_rate}%
                    </TableCell>
                    <TableCell align="right">
                      {result.execution_time}ms
                    </TableCell>
                    <TableCell>
                      {format(new Date(result.executed_date), "MMM dd, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  const renderTestDetails = () => {
    if (testResults.length === 0) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Test Details" />
        <CardContent>
          {testResults.slice(0, 3).map((result) => (
            <Accordion key={result.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Typography sx={{ flexGrow: 1 }}>
                    {result.test_name}
                  </Typography>
                  <Chip
                    label={result.status}
                    color={result.status === "passed" ? "success" : "error"}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Test Summary
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Total Steps:</strong> {result.total_steps}
                      <br />
                      <strong>Passed:</strong> {result.passed_steps}
                      <br />
                      <strong>Failed:</strong> {result.failed_steps}
                      <br />
                      <strong>Execution Time:</strong> {result.execution_time}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Test Steps
                    </Typography>
                    <List dense>
                      {result.steps.slice(0, 3).map((step) => (
                        <ListItem key={step.step_number}>
                          <ListItemIcon>
                            {step.status === "passed" ? (
                              <PassIcon color="success" />
                            ) : (
                              <FailIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={`Step ${step.step_number}: ${step.node_id}`}
                            secondary={step.error_message || "Passed"}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chatbot Testing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your chatbot flows interactively and run automated test suites
        </Typography>
      </Box>

      {/* Flow Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Flow to Test</InputLabel>
          <Select
            value={selectedFlow}
            label="Select Flow to Test"
            onChange={(e) => {
              setSelectedFlow(e.target.value);
              setTestSession(null);
              if (e.target.value) {
                loadTestHistory();
              }
            }}
          >
            {flows
              .filter((f) => f.is_active)
              .map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedFlow && (
        <Box>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Interactive Testing" />
            <Tab label="Automated Testing" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                {renderTestChat()}
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardHeader title="Session Info" />
                  <CardContent>
                    {testSession ? (
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Status"
                            secondary={
                              <Chip
                                label={testSession.status}
                                color={
                                  testSession.status === "running"
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Flow"
                            secondary={testSession.flowName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Messages"
                            secondary={testSession.messages.length}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Duration"
                            secondary={
                              testSession.endTime
                                ? `${Math.round((testSession.endTime.getTime() - testSession.startTime.getTime()) / 1000)}s`
                                : `${Math.round((new Date().getTime() - testSession.startTime.getTime()) / 1000)}s`
                            }
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Alert severity="info">
                        Start a test session to see session information
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              {renderAutomatedTests()}
              {renderTestDetails()}
            </Box>
          )}
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Test Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Configure how the testing interface behaves
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 300,
            }}
          >
            <FormControl>
              <InputLabel>Max Messages</InputLabel>
              <Select
                value={testSettings.maxMessages}
                label="Max Messages"
                onChange={(e) =>
                  setTestSettings((prev) => ({
                    ...prev,
                    maxMessages: e.target.value as number,
                  }))
                }
              >
                <MenuItem value={25}>25 messages</MenuItem>
                <MenuItem value={50}>50 messages</MenuItem>
                <MenuItem value={100}>100 messages</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Response Simulation
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="checkbox"
                  checked={testSettings.simulateDelay}
                  onChange={(e) =>
                    setTestSettings((prev) => ({
                      ...prev,
                      simulateDelay: e.target.checked,
                    }))
                  }
                />
                <Typography variant="body2">
                  Simulate response delays
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Debug Options
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={testSettings.logDebugInfo}
                    onChange={(e) =>
                      setTestSettings((prev) => ({
                        ...prev,
                        logDebugInfo: e.target.checked,
                      }))
                    }
                  />
                  <Typography variant="body2">Log debug information</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={testSettings.trackVariables}
                    onChange={(e) =>
                      setTestSettings((prev) => ({
                        ...prev,
                        trackVariables: e.target.checked,
                      }))
                    }
                  />
                  <Typography variant="body2">Track flow variables</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
