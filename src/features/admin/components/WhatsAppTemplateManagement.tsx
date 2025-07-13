import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  Typography,
} from "@mui/material";
import TemplateCreationForm from "./TemplateCreationForm";
import TemplateListView from "./TemplateListView";
import TemplateDetailsView from "./TemplateDetailsView";
import BulkSendModal from "./BulkSendModal";
import {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
  TemplateInsights,
  TemplateInteraction,
  BulkSendRequest,
  BulkSendResult,
  UserSegment,
} from "../types";
import { whatsappTemplateAPI, userSegmentAPI } from "../services/api";

type ViewMode = "list" | "create" | "edit" | "details";

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export default function WhatsAppTemplateManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [templateInsights, setTemplateInsights] =
    useState<TemplateInsights | null>(null);
  const [templateInteractions, setTemplateInteractions] = useState<
    TemplateInteraction[]
  >([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Load initial data
  useEffect(() => {
    loadTemplates();
    loadUserSegments();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await whatsappTemplateAPI.getAll();
      setTemplates(templatesData);
    } catch (error) {
      showNotification("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUserSegments = async () => {
    try {
      const segmentsData = await userSegmentAPI.getAll();
      setUserSegments(segmentsData);
    } catch (error) {
      console.error("Failed to load user segments:", error);
    }
  };

  const loadTemplateDetails = async (templateId: string) => {
    try {
      setActionLoading(true);
      const [insights, interactions] = await Promise.all([
        whatsappTemplateAPI.getInsights(templateId),
        whatsappTemplateAPI.getInteractions(templateId),
      ]);
      setTemplateInsights(insights);
      setTemplateInteractions(interactions);
    } catch (error) {
      showNotification("Failed to load template details", "error");
    } finally {
      setActionLoading(false);
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

  // Template CRUD operations
  const handleCreateTemplate = async (
    templateData: WhatsAppTemplateFormData,
  ) => {
    try {
      setActionLoading(true);
      const newTemplate = await whatsappTemplateAPI.create(templateData);
      setTemplates((prev) => [newTemplate, ...prev]);
      setViewMode("list");
      showNotification(
        "Template created successfully! It will be reviewed and approved.",
        "success",
      );
    } catch (error) {
      showNotification("Failed to create template", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTemplate = async (
    templateData: WhatsAppTemplateFormData,
  ) => {
    if (!selectedTemplate) return;

    try {
      setActionLoading(true);
      const updatedTemplate = await whatsappTemplateAPI.update(
        selectedTemplate.id,
        templateData,
      );
      setTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
      );
      setSelectedTemplate(updatedTemplate);
      setViewMode("details");
      showNotification("Template updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to update template", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setActionLoading(true);
      await whatsappTemplateAPI.delete(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      setViewMode("list");
      showNotification("Template deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete template", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Navigation handlers
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedTemplate(null);
    setTemplateInsights(null);
    setTemplateInteractions([]);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setViewMode("create");
  };

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setViewMode("edit");
  };

  const handleViewDetails = async (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setViewMode("details");
    await loadTemplateDetails(template.id);
  };

  const handleSendTemplate = (template: WhatsAppTemplate) => {
    if (template.status !== "approved") {
      showNotification("Only approved templates can be sent", "warning");
      return;
    }
    setSelectedTemplate(template);
    setBulkSendOpen(true);
  };

  const handleBulkSend = async (request: BulkSendRequest) => {
    try {
      setActionLoading(true);
      const result: BulkSendResult =
        await whatsappTemplateAPI.sendBulk(request);
      setBulkSendOpen(false);

      if (request.scheduledAt) {
        showNotification(
          `Template scheduled for ${request.recipients.length} recipients at ${new Date(request.scheduledAt).toLocaleString()}`,
          "success",
        );
      } else {
        showNotification(
          `Template sent to ${request.recipients.length} recipients. Processing in progress...`,
          "success",
        );
      }

      // Refresh insights if we're viewing details
      if (viewMode === "details" && selectedTemplate) {
        setTimeout(() => {
          loadTemplateDetails(selectedTemplate.id);
        }, 2000);
      }
    } catch (error) {
      showNotification("Failed to send template", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormCancel = () => {
    setViewMode("list");
    setSelectedTemplate(null);
  };

  // Render different views based on current mode
  const renderCurrentView = () => {
    switch (viewMode) {
      case "create":
        return (
          <TemplateCreationForm
            onSubmit={handleCreateTemplate}
            onCancel={handleFormCancel}
            loading={actionLoading}
          />
        );

      case "edit":
        return selectedTemplate ? (
          <TemplateCreationForm
            initialData={{
              name: selectedTemplate.name,
              category: selectedTemplate.category,
              language: selectedTemplate.language,
              header: selectedTemplate.header,
              body: selectedTemplate.body,
              footer: selectedTemplate.footer,
              buttons: selectedTemplate.buttons,
            }}
            onSubmit={handleUpdateTemplate}
            onCancel={handleFormCancel}
            loading={actionLoading}
          />
        ) : null;

      case "details":
        return selectedTemplate ? (
          <TemplateDetailsView
            template={selectedTemplate}
            insights={templateInsights}
            interactions={templateInteractions}
            loading={actionLoading}
            onBack={handleBackToList}
            onEdit={handleEditTemplate}
            onSend={handleSendTemplate}
            onDelete={handleDeleteTemplate}
          />
        ) : null;

      case "list":
      default:
        return (
          <TemplateListView
            templates={templates}
            loading={loading}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onSend={handleSendTemplate}
            onViewDetails={handleViewDetails}
            onCreate={handleCreateNew}
            onRefresh={loadTemplates}
          />
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Main Content */}
      {renderCurrentView()}

      {/* Bulk Send Modal */}
      <BulkSendModal
        open={bulkSendOpen}
        template={selectedTemplate}
        userSegments={userSegments}
        onClose={() => setBulkSendOpen(false)}
        onSend={handleBulkSend}
        loading={actionLoading}
      />

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
