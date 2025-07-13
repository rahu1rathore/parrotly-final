import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  TouchApp as TouchAppIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  WhatsAppTemplate,
  TemplateInsights,
  TemplateInteraction,
} from "../types";

interface TemplateDetailsViewProps {
  template: WhatsAppTemplate;
  insights: TemplateInsights | null;
  interactions: TemplateInteraction[];
  loading?: boolean;
  onBack: () => void;
  onEdit: (template: WhatsAppTemplate) => void;
  onSend: (template: WhatsAppTemplate) => void;
  onDelete: (templateId: string) => void;
}

const STATUS_COLORS = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  disabled: "default",
} as const;

const CATEGORY_COLORS = {
  marketing: "#FF6B35",
  utility: "#4ECDC4",
  authentication: "#45B7D1",
};

const INTERACTION_STATUS_COLORS = {
  sent: "#9e9e9e",
  delivered: "#2196f3",
  read: "#4caf50",
  clicked: "#ff9800",
  failed: "#f44336",
};

export default function TemplateDetailsView({
  template,
  insights,
  interactions,
  loading = false,
  onBack,
  onEdit,
  onSend,
  onDelete,
}: TemplateDetailsViewProps) {
  const [tabValue, setTabValue] = useState(0);
  const [interactionPage, setInteractionPage] = useState(0);
  const [interactionRowsPerPage, setInteractionRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const paginatedInteractions = interactions.slice(
    interactionPage * interactionRowsPerPage,
    interactionPage * interactionRowsPerPage + interactionRowsPerPage,
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInteractionPageChange = (event: unknown, newPage: number) => {
    setInteractionPage(newPage);
  };

  const handleInteractionRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setInteractionRowsPerPage(parseInt(event.target.value, 10));
    setInteractionPage(0);
  };

  const renderStatusChip = (status: WhatsAppTemplate["status"]) => (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLORS[status]}
      size="small"
      variant="filled"
    />
  );

  const renderCategoryChip = (category: WhatsAppTemplate["category"]) => (
    <Chip
      label={category.charAt(0).toUpperCase() + category.slice(1)}
      size="small"
      sx={{
        backgroundColor: CATEGORY_COLORS[category],
        color: "white",
        fontWeight: 500,
      }}
    />
  );

  const renderInteractionStatusChip = (
    status: TemplateInteraction["status"],
  ) => (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        backgroundColor: INTERACTION_STATUS_COLORS[status],
        color: "white",
        fontWeight: 500,
      }}
    />
  );

  const renderTemplatePreview = () => (
    <Card sx={{ maxWidth: 400, mx: "auto", backgroundColor: "#f0f0f0" }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            backgroundColor: "#075e54",
            color: "white",
            p: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="caption">WhatsApp Template Preview</Typography>
        </Box>

        <Box sx={{ p: 2, backgroundColor: "white", minHeight: 200 }}>
          {/* Header */}
          {template.header && (
            <Box sx={{ mb: 2 }}>
              {template.header.type === "text" ? (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "#128c7e" }}
                >
                  {template.header.content}
                </Typography>
              ) : (
                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: "#e0e0e0",
                      p: 2,
                      borderRadius: 1,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 60,
                    }}
                  >
                    {template.header.type === "image" && (
                      <ImageIcon sx={{ mr: 1 }} />
                    )}
                    {template.header.type === "video" && (
                      <VideoIcon sx={{ mr: 1 }} />
                    )}
                    {template.header.type === "document" && (
                      <DocumentIcon sx={{ mr: 1 }} />
                    )}
                    <Typography variant="caption">
                      {template.header.content}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Body */}
          <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {template.body}
          </Typography>

          {/* Footer */}
          {template.footer && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              {template.footer}
            </Typography>
          )}

          {/* Buttons */}
          {template.buttons.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {template.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    mb: 0.5,
                    textTransform: "none",
                    borderColor: "#128c7e",
                    color: "#128c7e",
                    "&:hover": {
                      backgroundColor: "#128c7e",
                      color: "white",
                    },
                  }}
                >
                  {button.type === "call_to_action" && !button.phoneNumber && (
                    <LinkIcon sx={{ mr: 1, fontSize: 16 }} />
                  )}
                  {button.type === "call_to_action" && button.phoneNumber && (
                    <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                  )}
                  {button.text}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderInsightsCards = () => {
    if (!insights) {
      return (
        <Alert severity="info">
          No analytics data available. Send this template to start collecting
          insights.
        </Alert>
      );
    }

    const cards = [
      {
        title: "Total Sent",
        value: insights.totalSent.toLocaleString(),
        icon: <SendIcon />,
        color: "#2196f3",
      },
      {
        title: "Delivered",
        value: insights.delivered.toLocaleString(),
        subtitle: `${insights.deliveryRate}% delivery rate`,
        icon: <CheckCircleIcon />,
        color: "#4caf50",
      },
      {
        title: "Read",
        value: insights.read.toLocaleString(),
        subtitle: `${insights.readRate}% read rate`,
        icon: <VisibilityIcon />,
        color: "#ff9800",
      },
      {
        title: "Clicked",
        value: insights.clicked.toLocaleString(),
        subtitle: `${insights.clickRate}% click rate`,
        icon: <TouchAppIcon />,
        color: "#9c27b0",
      },
    ];

    return (
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    {card.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderPerformanceChart = () => {
    if (!insights || insights.totalSent === 0) {
      return (
        <Alert severity="info">
          Performance metrics will be available after the template is sent.
        </Alert>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Funnel
          </Typography>

          <Box sx={{ mt: 3 }}>
            {/* Delivery Rate */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Delivery Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {insights.deliveryRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={insights.deliveryRate}
                sx={{ height: 8, borderRadius: 4 }}
                color="primary"
              />
            </Box>

            {/* Read Rate */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Read Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {insights.readRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={insights.readRate}
                sx={{ height: 8, borderRadius: 4 }}
                color="warning"
              />
            </Box>

            {/* Click Rate */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Click Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {insights.clickRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={insights.clickRate}
                sx={{ height: 8, borderRadius: 4 }}
                color="secondary"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderInteractionsTable = () => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            User Interactions ({interactions.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => {
              /* Export interactions */
            }}
          >
            Export
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Sent At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivered At</TableCell>
                <TableCell>Read At</TableCell>
                <TableCell>Clicked At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInteractions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography>
                      No interactions found for this template.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInteractions.map((interaction) => (
                  <TableRow key={interaction.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}
                        >
                          {interaction.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {interaction.userName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {interaction.userPhone}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(interaction.sentAt), "MMM dd, yyyy")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(interaction.sentAt), "hh:mm a")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {renderInteractionStatusChip(interaction.status)}
                    </TableCell>

                    <TableCell>
                      {interaction.deliveredAt ? (
                        <>
                          <Typography variant="body2">
                            {format(
                              new Date(interaction.deliveredAt),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(interaction.deliveredAt),
                              "hh:mm a",
                            )}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {interaction.readAt ? (
                        <>
                          <Typography variant="body2">
                            {format(
                              new Date(interaction.readAt),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(interaction.readAt), "hh:mm a")}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {interaction.clickedAt ? (
                        <>
                          <Typography variant="body2">
                            {format(
                              new Date(interaction.clickedAt),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(interaction.clickedAt), "hh:mm a")}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={interactions.length}
          rowsPerPage={interactionRowsPerPage}
          page={interactionPage}
          onPageChange={handleInteractionPageChange}
          onRowsPerPageChange={handleInteractionRowsPerPageChange}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" component="h1">
                {template.name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                {renderStatusChip(template.status)}
                {renderCategoryChip(template.category)}
                <Chip
                  label={template.language.toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {template.status === "approved" && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => onSend(template)}
              >
                Send Template
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(template)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Template Preview" />
          <Tab label="Analytics" />
          <Tab label="User Interactions" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Template Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Template ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {template.id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body2">{template.createdBy}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body2">
                  {format(
                    new Date(template.createdDate),
                    "MMMM dd, yyyy at hh:mm a",
                  )}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {format(
                    new Date(template.updatedDate),
                    "MMMM dd, yyyy at hh:mm a",
                  )}
                </Typography>
              </Box>
              {template.variables && template.variables.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Variables ({template.variables.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {template.variables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{{${variable}}}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "sticky", top: 20 }}>
              {renderTemplatePreview()}
            </Box>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box spacing={3}>
          <Box sx={{ mb: 3 }}>{renderInsightsCards()}</Box>
          <Box sx={{ mb: 3 }}>{renderPerformanceChart()}</Box>
        </Box>
      )}

      {tabValue === 2 && <Box>{renderInteractionsTable()}</Box>}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{template.name}"? This
            action cannot be undone.
          </Typography>
          {template.status === "approved" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This template is currently approved and may be in use. Deleting it
              will prevent future sends using this template.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onDelete(template.id);
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Delete Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
