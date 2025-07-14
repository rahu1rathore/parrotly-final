import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon,
  ExitToApp as ExitIcon,
} from "@mui/icons-material";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ChatbotFlow, ChatbotAnalytics } from "../types";
import { chatbotFlowAPI, chatbotConversationAPI } from "../services/api";

interface ChatbotAnalyticsDashboardProps {
  flows: ChatbotFlow[];
}

interface MetricCard {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function ChatbotAnalyticsDashboard({
  flows,
}: ChatbotAnalyticsDashboardProps) {
  const [selectedFlow, setSelectedFlow] = useState<string>("all");
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedFlow, dateRange]);

  const loadAnalytics = async () => {
    if (selectedFlow === "all") return;

    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = subDays(
        endDate,
        dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90,
      );

      const response = await chatbotConversationAPI.getAnalytics(selectedFlow, {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallMetrics = (): MetricCard[] => {
    if (selectedFlow === "all") {
      const totalConversations = flows.reduce(
        (sum, flow) => sum + flow.total_conversations,
        0,
      );
      const avgCompletionRate =
        flows.reduce((sum, flow) => sum + flow.completion_rate, 0) /
        flows.length;
      const avgCompletionTime =
        flows.reduce((sum, flow) => sum + flow.average_completion_time, 0) /
        flows.length;

      return [
        {
          title: "Total Conversations",
          value: totalConversations.toLocaleString(),
          trend: 12.5,
          icon: <ChatIcon />,
          color: "#4f46e5",
          description: "Across all active flows",
        },
        {
          title: "Active Flows",
          value: flows.filter((f) => f.is_active).length,
          trend: 0,
          icon: <TimelineIcon />,
          color: "#16a34a",
          description: "Currently published flows",
        },
        {
          title: "Avg Completion Rate",
          value: `${avgCompletionRate.toFixed(1)}%`,
          trend: 3.2,
          icon: <CheckCircleIcon />,
          color: "#0891b2",
          description: "Average across all flows",
        },
        {
          title: "Avg Response Time",
          value: `${avgCompletionTime.toFixed(0)}s`,
          trend: -5.1,
          icon: <SpeedIcon />,
          color: "#dc2626",
          description: "Time to complete flows",
        },
      ];
    }

    if (!analytics) return [];

    return [
      {
        title: "Total Conversations",
        value: analytics.total_conversations.toLocaleString(),
        trend: 8.3,
        icon: <ChatIcon />,
        color: "#4f46e5",
        description: "In selected period",
      },
      {
        title: "Completion Rate",
        value: `${analytics.completion_rate}%`,
        trend: analytics.completion_rate > 80 ? 2.1 : -1.5,
        icon: <CheckCircleIcon />,
        color: "#16a34a",
        description: "Successfully completed flows",
      },
      {
        title: "Avg Completion Time",
        value: `${analytics.average_completion_time}s`,
        trend: -3.2,
        icon: <SpeedIcon />,
        color: "#0891b2",
        description: "Time to complete flow",
      },
      {
        title: "Unique Users",
        value: analytics.unique_users.toLocaleString(),
        trend: 15.7,
        icon: <PeopleIcon />,
        color: "#7c3aed",
        description: "Distinct users engaged",
      },
    ];
  };

  const renderMetricCard = (metric: MetricCard) => (
    <Card key={metric.title}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: metric.color, width: 48, height: 48 }}>
            {metric.icon}
          </Avatar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {metric.trend !== 0 && (
              <>
                {metric.trend > 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={metric.trend > 0 ? "success.main" : "error.main"}
                  fontWeight="bold"
                >
                  {Math.abs(metric.trend)}%
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {metric.value}
        </Typography>
        <Typography variant="h6" color="text.primary" gutterBottom>
          {metric.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {metric.description}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderNodePerformance = () => {
    if (!analytics || selectedFlow === "all") return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Node Performance Analysis
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Node</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Visits</TableCell>
                  <TableCell align="right">Exits</TableCell>
                  <TableCell align="right">Completion Rate</TableCell>
                  <TableCell align="right">Avg Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.node_analytics.map((node) => (
                  <TableRow key={node.node_id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {node.node_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={node.node_type}
                        size="small"
                        color={
                          node.node_type === "text"
                            ? "primary"
                            : node.node_type === "button"
                              ? "success"
                              : "secondary"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {node.visits.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {node.exits}
                        {node.exits > 0 && (
                          <ExitIcon
                            color="warning"
                            sx={{ ml: 0.5, fontSize: 16 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={node.completion_rate}
                          sx={{ width: 60, mr: 1 }}
                          color={
                            node.completion_rate > 80
                              ? "success"
                              : node.completion_rate > 60
                                ? "warning"
                                : "error"
                          }
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {node.completion_rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {node.average_time_spent}s
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderPopularPaths = () => {
    if (!analytics || selectedFlow === "all") return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Popular Conversation Paths
          </Typography>
          <List>
            {analytics.popular_paths.slice(0, 5).map((path, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {path.path.map((nodeId, idx) => (
                          <React.Fragment key={nodeId}>
                            <Chip
                              label={nodeId}
                              size="small"
                              variant="outlined"
                            />
                            {idx < path.path.length - 1 && (
                              <Typography variant="body2">→</Typography>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {path.count} users
                        </Typography>
                        <Chip
                          label={`${path.completion_rate}% completion`}
                          size="small"
                          color={
                            path.completion_rate > 80 ? "success" : "warning"
                          }
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < analytics.popular_paths.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderUsagePatterns = () => {
    if (!analytics || selectedFlow === "all") return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usage Patterns
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Peak Usage Hours
              </Typography>
              {analytics.peak_usage_hours.map((hour) => (
                <Box
                  key={hour.hour}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {hour.hour}:00 - {hour.hour + 1}:00
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (hour.count /
                        Math.max(
                          ...analytics.peak_usage_hours.map((h) => h.count),
                        )) *
                      100
                    }
                    sx={{ flexGrow: 1, mx: 2 }}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {hour.count}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                User Engagement
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Unique Users
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {analytics.unique_users}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Returning Users
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {analytics.returning_users}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Return Rate
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {(
                      (analytics.returning_users / analytics.unique_users) *
                      100
                    ).toFixed(1)}
                    %
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderTopPerformingFlows = () => {
    if (selectedFlow !== "all") return null;

    const sortedFlows = [...flows]
      .filter((f) => f.is_active)
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 5);

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Performing Flows
          </Typography>
          <List>
            {sortedFlows.map((flow, index) => (
              <React.Fragment key={flow.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor:
                          index === 0
                            ? "#ffd700"
                            : index === 1
                              ? "#c0c0c0"
                              : index === 2
                                ? "#cd7f32"
                                : "primary.main",
                        width: 32,
                        height: 32,
                      }}
                    >
                      {index === 0 ? <StarIcon /> : index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={flow.name}
                    secondary={
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip
                          label={`${flow.completion_rate}% completion`}
                          size="small"
                          color="success"
                        />
                        <Chip
                          label={`${flow.total_conversations} conversations`}
                          size="small"
                        />
                        <Chip
                          label={`${flow.average_completion_time}s avg time`}
                          size="small"
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < sortedFlows.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chatbot Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed insights into your chatbot performance and user engagement
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Flow</InputLabel>
              <Select
                value={selectedFlow}
                label="Flow"
                onChange={(e) => setSelectedFlow(e.target.value)}
              >
                <MenuItem value="all">All Flows</MenuItem>
                {flows.map((flow) => (
                  <MenuItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={dateRange}
                label="Time Period"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getOverallMetrics().map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            {renderMetricCard(metric)}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {renderNodePerformance()}
          <Box sx={{ mt: 3 }}>{renderPopularPaths()}</Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {renderUsagePatterns()}
          <Box sx={{ mt: 3 }}>{renderTopPerformingFlows()}</Box>
        </Grid>
      </Grid>
    </Container>
  );
}
