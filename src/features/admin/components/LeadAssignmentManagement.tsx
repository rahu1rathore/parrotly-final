import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AssignmentInd as AssignmentIndIcon,
  PersonOff as PersonOffIcon,
  AutoAwesome as AutoIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Lead, Agent, LeadAssignment, ActivityLog } from "../types";

interface LeadAssignmentManagementProps {
  leads: Lead[];
  agents: Agent[];
  assignments: LeadAssignment[];
  activityLogs: ActivityLog[];
  loading?: boolean;
  onAssignLead: (leadId: string, agentId: string, notes?: string) => void;
  onBulkAssign: (leadIds: string[], agentId: string, notes?: string) => void;
  onUnassignLead: (leadId: string) => void;
  onRefresh?: () => void;
}

export default function LeadAssignmentManagement({
  leads,
  agents,
  assignments,
  activityLogs,
  loading = false,
  onAssignLead,
  onBulkAssign,
  onUnassignLead,
  onRefresh,
}: LeadAssignmentManagementProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Categorize leads
  const unassignedLeads = leads.filter((lead) => !lead.assignedTo);
  const assignedLeads = leads.filter((lead) => lead.assignedTo);

  // Filter based on current tab and search
  const getFilteredLeads = () => {
    let baseLeads =
      currentTab === 0
        ? leads
        : currentTab === 1
          ? assignedLeads
          : unassignedLeads;

    return baseLeads.filter((lead) => {
      const matchesSearch =
        lead.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(lead.data)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (lead.campaignName &&
          lead.campaignName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAgent = !selectedAgent || lead.assignedTo === selectedAgent;

      return matchesSearch && matchesAgent;
    });
  };

  const filteredLeads = getFilteredLeads();
  const paginatedLeads = filteredLeads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Calculate agent statistics
  const getAgentStats = (agent: Agent) => {
    const agentLeads = leads.filter((lead) => lead.assignedTo === agent.id);
    const completedLeads = agentLeads.filter(
      (lead) => lead.status === "converted",
    ).length;
    const conversionRate =
      agentLeads.length > 0 ? (completedLeads / agentLeads.length) * 100 : 0;

    return {
      totalAssigned: agentLeads.length,
      completed: completedLeads,
      conversionRate: conversionRate.toFixed(1),
    };
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map((lead) => lead.id));
    }
  };

  const handleAssignLead = (lead: Lead) => {
    setSelectedLeads([lead.id]);
    setAssignDialogOpen(true);
  };

  const handleBulkAssignClick = () => {
    if (selectedLeads.length === 0) {
      alert("Please select leads to assign");
      return;
    }
    setBulkAssignDialogOpen(true);
  };

  const handleAssignSubmit = (agentId: string) => {
    if (selectedLeads.length === 1) {
      onAssignLead(selectedLeads[0], agentId, assignmentNotes);
    } else {
      onBulkAssign(selectedLeads, agentId, assignmentNotes);
    }
    setAssignDialogOpen(false);
    setBulkAssignDialogOpen(false);
    setSelectedLeads([]);
    setAssignmentNotes("");
  };

  const handleAutoAssign = () => {
    if (unassignedLeads.length === 0) {
      alert("No unassigned leads available");
      return;
    }

    // Simple round-robin assignment
    const activeAgents = agents.filter((agent) => agent.isActive);
    if (activeAgents.length === 0) {
      alert("No active agents available");
      return;
    }

    // Sort agents by current workload (ascending)
    const sortedAgents = activeAgents.sort(
      (a, b) => getAgentStats(a).totalAssigned - getAgentStats(b).totalAssigned,
    );

    const leadsToAssign = unassignedLeads.slice(0, 10); // Assign up to 10 leads
    leadsToAssign.forEach((lead, index) => {
      const agent = sortedAgents[index % sortedAgents.length];
      onAssignLead(lead.id, agent.id, "Auto-assigned by system");
    });
  };

  const renderAgentCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {agents.map((agent) => {
        const stats = getAgentStats(agent);
        const workloadPercentage = Math.min(
          (stats.totalAssigned / 50) * 100,
          100,
        ); // Assuming max 50 leads per agent

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    src={agent.avatar}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {agent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.role}
                    </Typography>
                    <Chip
                      label={agent.isActive ? "Active" : "Inactive"}
                      color={agent.isActive ? "success" : "default"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Workload</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {stats.totalAssigned} leads
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={workloadPercentage}
                    sx={{ height: 6, borderRadius: 3 }}
                    color={
                      workloadPercentage > 80
                        ? "error"
                        : workloadPercentage > 60
                          ? "warning"
                          : "primary"
                    }
                  />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Converted
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {stats.completed}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Rate
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "success.main" }}
                    >
                      {stats.conversionRate}%
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  View Leads
                </Button>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderAssignmentStats = () => {
    const totalLeads = leads.length;
    const assignedCount = assignedLeads.length;
    const unassignedCount = unassignedLeads.length;
    const assignmentRate =
      totalLeads > 0 ? (assignedCount / totalLeads) * 100 : 0;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <AssignmentIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {totalLeads}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Leads
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <AssignmentIndIcon
                sx={{ fontSize: 48, color: "success.main", mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {assignedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PersonOffIcon
                sx={{ fontSize: 48, color: "warning.main", mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {unassignedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unassigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUpIcon
                sx={{ fontSize: 48, color: "info.main", mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {assignmentRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignment Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderLeadsTable = () => (
    <Paper>
      {/* Controls */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Agent</InputLabel>
              <Select
                value={selectedAgent}
                label="Filter by Agent"
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <MenuItem value="">All Agents</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {selectedLeads.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIndIcon />}
                  onClick={handleBulkAssignClick}
                >
                  Assign ({selectedLeads.length})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<AutoIcon />}
                onClick={handleAutoAssign}
                disabled={unassignedLeads.length === 0}
              >
                Auto Assign
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAgent("");
                }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={
                    selectedLeads.length === paginatedLeads.length &&
                    paginatedLeads.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Assignment Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography>Loading assignments...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography>
                    No leads found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => {
                const assignedAgent = agents.find(
                  (a) => a.id === lead.assignedTo,
                );

                return (
                  <TableRow key={lead.id} hover>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <PhoneIcon
                            sx={{
                              fontSize: 16,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {lead.phoneNumber}
                          </Typography>
                        </Box>
                        {lead.data.email && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon
                              sx={{
                                fontSize: 16,
                                mr: 1,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {lead.data.email}
                            </Typography>
                          </Box>
                        )}
                        {lead.data.fullName && (
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500 }}
                          >
                            {lead.data.fullName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CampaignIcon
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {lead.campaignName || "No Campaign"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          lead.status.charAt(0).toUpperCase() +
                          lead.status.slice(1)
                        }
                        size="small"
                        color={
                          lead.status === "converted"
                            ? "success"
                            : lead.status === "qualified"
                              ? "primary"
                              : lead.status === "contacted"
                                ? "info"
                                : lead.status === "dropped"
                                  ? "error"
                                  : "default"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {assignedAgent ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={assignedAgent.avatar}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {assignedAgent.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {assignedAgent.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {assignedAgent.role}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Chip
                          label="Unassigned"
                          size="small"
                          variant="outlined"
                          color="warning"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {lead.assignedDate ? (
                        <Box>
                          <Typography variant="body2">
                            {format(
                              new Date(lead.assignedDate),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {lead.assignedBy?.split("@")[0] || "System"}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {lead.assignedTo ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => onUnassignLead(lead.id)}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAssignLead(lead)}
                        >
                          Assign
                        </Button>
                      )}
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
        count={filteredLeads.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );

  const tabLabels = ["All Leads", "Assigned", "Unassigned"];

  return (
    <Box>
      {/* Assignment Statistics */}
      {renderAssignmentStats()}

      {/* Agent Performance Cards */}
      <Typography variant="h6" gutterBottom>
        Agent Performance
      </Typography>
      {renderAgentCards()}

      {/* Lead Assignment Table */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lead Assignments
        </Typography>

        {/* Filter Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
          >
            {tabLabels.map((label, index) => {
              const count =
                index === 0
                  ? leads.length
                  : index === 1
                    ? assignedLeads.length
                    : unassignedLeads.length;
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

        {renderLeadsTable()}
      </Box>

      {/* Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Lead to Agent</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents
                .filter((agent) => agent.isActive)
                .map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        src={agent.avatar}
                        sx={{ width: 32, height: 32, mr: 2 }}
                      >
                        {agent.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getAgentStats(agent).totalAssigned} assigned leads
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Assignment Notes (Optional)"
            multiline
            rows={3}
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            placeholder="Add notes about this assignment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleAssignSubmit(selectedAgent)}
            variant="contained"
            disabled={!selectedAgent}
          >
            Assign Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bulk Assign {selectedLeads.length} Leads</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to assign {selectedLeads.length} leads to the selected
            agent.
          </Alert>

          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents
                .filter((agent) => agent.isActive)
                .map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        src={agent.avatar}
                        sx={{ width: 32, height: 32, mr: 2 }}
                      >
                        {agent.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Currently: {getAgentStats(agent).totalAssigned}{" "}
                          assigned leads
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Assignment Notes (Optional)"
            multiline
            rows={3}
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            placeholder="Add notes about this bulk assignment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleAssignSubmit(selectedAgent)}
            variant="contained"
            disabled={!selectedAgent}
          >
            Assign {selectedLeads.length} Leads
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
