import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  FormBuilder as FormBuilderIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Task as TaskIcon,
} from "@mui/icons-material";
import CampaignManagement from "./CampaignManagement";
import DynamicFormBuilder from "./DynamicFormBuilder";
import LeadManagement from "./LeadManagement";
import {
  Campaign,
  CampaignFormData,
  DynamicForm,
  Lead,
  LeadFormData,
  Task,
  TaskFormData,
  Agent,
  CampaignStats,
  LeadStats,
} from "../types";
import {
  campaignAPI,
  dynamicFormAPI,
  leadAPI,
  taskAPI,
  agentAPI,
} from "../services/api";

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export default function LeadManagementSystem() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dynamicForms, setDynamicForms] = useState<DynamicForm[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats>();
  const [leadStats, setLeadStats] = useState<LeadStats>();

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        campaignsData,
        formsData,
        leadsData,
        tasksData,
        agentsData,
        campaignStatsData,
        leadStatsData,
      ] = await Promise.all([
        campaignAPI.getAll(),
        dynamicFormAPI.getAll(),
        leadAPI.getAll(),
        taskAPI.getAll(),
        agentAPI.getAll(),
        campaignAPI.getStats(),
        leadAPI.getStats(),
      ]);

      setCampaigns(campaignsData);
      setDynamicForms(formsData);
      setLeads(leadsData);
      setTasks(tasksData);
      setAgents(agentsData);
      setCampaignStats(campaignStatsData);
      setLeadStats(leadStatsData);
    } catch (error) {
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    message: string,
    severity: NotificationState["severity"] = "info",
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Campaign handlers
  const handleCreateCampaign = async (campaignData: CampaignFormData) => {
    try {
      setActionLoading(true);
      const newCampaign = await campaignAPI.create(campaignData);
      setCampaigns((prev) => [newCampaign, ...prev]);
      showNotification("Campaign created successfully!", "success");
    } catch (error) {
      showNotification("Failed to create campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCampaign = async (
    id: string,
    campaignData: CampaignFormData,
  ) => {
    try {
      setActionLoading(true);
      const updatedCampaign = await campaignAPI.update(id, campaignData);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? updatedCampaign : c)),
      );
      showNotification("Campaign updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to update campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setActionLoading(true);
      await campaignAPI.delete(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showNotification("Campaign deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    // Navigate to campaign details or open modal
    showNotification(`Viewing campaign: ${campaign.name}`, "info");
  };

  // Dynamic Form handlers
  const handleCreateForm = async (formData: Partial<DynamicForm>) => {
    try {
      setActionLoading(true);
      const newForm = await dynamicFormAPI.create(formData);
      setDynamicForms((prev) => [newForm, ...prev]);
      showNotification("Form created successfully!", "success");
    } catch (error) {
      showNotification("Failed to create form", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateForm = async (
    id: string,
    formData: Partial<DynamicForm>,
  ) => {
    try {
      setActionLoading(true);
      const updatedForm = await dynamicFormAPI.update(id, formData);
      setDynamicForms((prev) =>
        prev.map((f) => (f.id === id ? updatedForm : f)),
      );
      showNotification("Form updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to update form", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      setActionLoading(true);
      await dynamicFormAPI.delete(id);
      setDynamicForms((prev) => prev.filter((f) => f.id !== id));
      showNotification("Form deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete form", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    {
      label: "Campaigns",
      icon: <CampaignIcon />,
      component: (
        <CampaignManagement
          campaigns={campaigns}
          dynamicForms={dynamicForms}
          campaignStats={campaignStats}
          loading={loading}
          onCreateCampaign={handleCreateCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onViewCampaign={handleViewCampaign}
          onRefresh={loadAllData}
        />
      ),
    },
    {
      label: "Dynamic Forms",
      icon: <FormBuilderIcon />,
      component: (
        <DynamicFormBuilder
          forms={dynamicForms}
          onCreateForm={handleCreateForm}
          onUpdateForm={handleUpdateForm}
          onDeleteForm={handleDeleteForm}
        />
      ),
    },
    {
      label: "Leads",
      icon: <PeopleIcon />,
      component: (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Lead Management Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will show lead CRUD operations, filtering, and status
            management. Currently showing mock data: {leads.length} leads
            loaded.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Lead Management component is being built with table view, filters,
            bulk operations, and assignment features.
          </Alert>
        </Box>
      ),
    },
    {
      label: "Assignments",
      icon: <AssignmentIcon />,
      component: (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Lead Assignment Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will show lead assignment to agents, bulk assignment, and
            assignment history. Currently showing {agents.length} agents
            available for assignments.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Assignment component includes manual/automatic assignment, agent
            workload management, and assignment analytics.
          </Alert>
        </Box>
      ),
    },
    {
      label: "Tasks",
      icon: <TaskIcon />,
      component: (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Task Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will show task creation, assignment, and tracking for lead
            follow-ups. Currently showing {tasks.length} tasks in the system.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Task Management includes follow-up scheduling, reminders, task
            completion tracking, and outcome recording.
          </Alert>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Loading Lead Management System...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>{tabs[currentTab]?.component}</Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Processing...
          </Typography>
        </Box>
      </Backdrop>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
