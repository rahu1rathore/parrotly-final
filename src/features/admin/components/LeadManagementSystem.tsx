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
  Description as FormBuilderIcon,
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
  LeadFilter,
  Task,
  TaskFormData,
  Agent,
  CampaignStats,
  LeadStats,
  BulkUploadResult,
} from "../types";
import {
  campaignAPI,
  dynamicFormAPI,
  leadAPI,
  taskAPI,
  agentAPI,
  bulkUploadAPI,
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

  // Lead handlers
  const handleCreateLead = async (leadData: LeadFormData) => {
    try {
      setActionLoading(true);
      const newLead = await leadAPI.create(leadData);
      setLeads((prev) => [newLead, ...prev]);
      showNotification("Lead created successfully!", "success");
    } catch (error) {
      showNotification("Failed to create lead", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLead = async (
    id: string,
    leadData: Partial<LeadFormData>,
  ) => {
    try {
      setActionLoading(true);
      const updatedLead = await leadAPI.update(id, leadData);
      setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
      showNotification("Lead updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to update lead", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      setActionLoading(true);
      await leadAPI.delete(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showNotification("Lead deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete lead", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignLead = async (leadId: string, agentId: string) => {
    try {
      setActionLoading(true);
      await leadAPI.assign(leadId, agentId);
      // Refresh leads to get updated assignment
      const updatedLeads = await leadAPI.getAll();
      setLeads(updatedLeads);
      showNotification("Lead assigned successfully!", "success");
    } catch (error) {
      showNotification("Failed to assign lead", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAssign = async (leadIds: string[], agentId: string) => {
    try {
      setActionLoading(true);
      await leadAPI.bulkAssign(leadIds, agentId);
      // Refresh leads to get updated assignments
      const updatedLeads = await leadAPI.getAll();
      setLeads(updatedLeads);
      showNotification(
        `${leadIds.length} leads assigned successfully!`,
        "success",
      );
    } catch (error) {
      showNotification("Failed to assign leads", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeadFilterChange = async (filter: LeadFilter) => {
    try {
      const filteredLeads = await leadAPI.getAll(filter);
      setLeads(filteredLeads);
    } catch (error) {
      showNotification("Failed to filter leads", "error");
    }
  };

  const handleBulkUpload = async (
    file: File,
    campaignId: string,
    fieldMapping: Record<string, string>,
  ): Promise<BulkUploadResult> => {
    try {
      const result = await bulkUploadAPI.upload(file, campaignId);
      // Refresh leads after upload
      await loadAllData();
      showNotification(
        `Bulk upload completed! ${result.successCount} leads imported successfully.`,
        result.errorCount > 0 ? "warning" : "success",
      );
      return result;
    } catch (error) {
      showNotification("Bulk upload failed", "error");
      throw error;
    }
  };

  const handleBulkDownload = async (
    format: "csv" | "excel",
    filters: LeadFilter,
    fields: string[],
  ) => {
    try {
      // Get filtered leads
      const leadsToExport = await leadAPI.getAll(filters);

      // Prepare CSV content
      const headers = fields;
      const rows = leadsToExport.map((lead) => {
        return fields.map((field) => {
          switch (field) {
            case "phoneNumber":
              return lead.phoneNumber;
            case "status":
              return lead.status;
            case "priority":
              return lead.priority;
            case "source":
              return lead.source;
            case "campaignName":
              return lead.campaignName || "";
            case "assignedTo":
              return agents.find((a) => a.id === lead.assignedTo)?.name || "";
            case "createdDate":
              return lead.createdDate;
            default:
              return lead.data[field] || "";
          }
        });
      });

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `leads_export_${new Date().toISOString().split("T")[0]}.${format}`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(
        `${leadsToExport.length} leads exported successfully!`,
        "success",
      );
    } catch (error) {
      showNotification("Export failed", "error");
      throw error;
    }
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
        <LeadManagement
          leads={leads}
          campaigns={campaigns}
          dynamicForms={dynamicForms}
          agents={agents}
          leadStats={leadStats}
          loading={loading}
          onCreateLead={handleCreateLead}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onAssignLead={handleAssignLead}
          onBulkAssign={handleBulkAssign}
          onFilterChange={handleLeadFilterChange}
          onRefresh={loadAllData}
        />
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
