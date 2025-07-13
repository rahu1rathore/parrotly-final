import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Group as GroupIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { WhatsAppTemplate, UserSegment, BulkSendRequest } from "../types";

interface BulkSendModalProps {
  open: boolean;
  template: WhatsAppTemplate | null;
  userSegments: UserSegment[];
  onClose: () => void;
  onSend: (request: BulkSendRequest) => void;
  loading?: boolean;
}

interface Recipient {
  phone: string;
  name?: string;
  variables?: Record<string, string>;
  isValid?: boolean;
  error?: string;
}

const steps = ["Select Recipients", "Configure Variables", "Review & Send"];

export default function BulkSendModal({
  open,
  template,
  userSegments,
  onClose,
  onSend,
  loading = false,
}: BulkSendModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [useScheduling, setUseScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedSegment("");
    setRecipients([]);
    setCsvFile(null);
    setUploadError("");
    setUseScheduling(false);
    setScheduledAt("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadError("Please upload a valid CSV file");
      return;
    }

    setCsvFile(file);
    setUploadError("");

    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setUploadError(
          "CSV file must contain headers and at least one data row",
        );
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const phoneIndex = headers.findIndex(
        (h) =>
          h.includes("phone") || h.includes("mobile") || h.includes("number"),
      );
      const nameIndex = headers.findIndex((h) => h.includes("name"));

      if (phoneIndex === -1) {
        setUploadError(
          "CSV must contain a phone number column (phone, mobile, or number)",
        );
        return;
      }

      const parsedRecipients: Recipient[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        const phone = row[phoneIndex]?.trim();
        const name = nameIndex !== -1 ? row[nameIndex]?.trim() : "";

        if (phone) {
          const variables: Record<string, string> = {};

          // Map other columns as variables for template
          headers.forEach((header, index) => {
            if (index !== phoneIndex && index !== nameIndex && row[index]) {
              variables[header] = row[index].trim();
            }
          });

          parsedRecipients.push({
            phone: phone.startsWith("+") ? phone : `+${phone}`,
            name: name || undefined,
            variables:
              Object.keys(variables).length > 0 ? variables : undefined,
            isValid: validatePhoneNumber(phone),
          });
        }
      }

      setRecipients(parsedRecipients);
    };

    reader.readAsText(file);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - should start with + and contain 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSegmentSelect = (segmentId: string) => {
    const segment = userSegments.find((s) => s.id === segmentId);
    if (!segment) return;

    setSelectedSegment(segmentId);

    // Generate mock recipients based on segment
    const mockRecipients: Recipient[] = [];
    for (let i = 1; i <= Math.min(segment.userCount, 100); i++) {
      mockRecipients.push({
        phone: `+1234567${(i + 1000).toString().slice(-3)}`,
        name: `User ${i}`,
        isValid: true,
      });
    }

    setRecipients(mockRecipients);
  };

  const updateRecipientVariable = (
    index: number,
    variableName: string,
    value: string,
  ) => {
    setRecipients((prev) =>
      prev.map((recipient, i) =>
        i === index
          ? {
              ...recipient,
              variables: {
                ...recipient.variables,
                [variableName]: value,
              },
            }
          : recipient,
      ),
    );
  };

  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!template) return;

    const validRecipients = recipients.filter((r) => r.isValid);

    const request: BulkSendRequest = {
      templateId: template.id,
      recipients: validRecipients.map((r) => ({
        phone: r.phone,
        name: r.name,
        variables: r.variables,
      })),
      scheduledAt: useScheduling ? scheduledAt : undefined,
    };

    onSend(request);
  };

  const downloadSampleCsv = () => {
    const sampleData = template?.variables?.length
      ? `phone,name,${template.variables.join(",")}\n+1234567890,"John Doe",${template.variables.map(() => "Sample Value").join(",")}`
      : 'phone,name\n+1234567890,"John Doe"';

    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "sample_recipients.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const validRecipients = recipients.filter((r) => r.isValid);
  const invalidRecipients = recipients.filter((r) => !r.isValid);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Recipients
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose how you want to select recipients for your template.
            </Typography>

            <Grid container spacing={3}>
              {/* User Segments */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <GroupIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">User Segments</Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Segment</InputLabel>
                      <Select
                        value={selectedSegment}
                        label="Select Segment"
                        onChange={(e) => handleSegmentSelect(e.target.value)}
                      >
                        {userSegments.map((segment) => (
                          <MenuItem key={segment.id} value={segment.id}>
                            <Box>
                              <Typography variant="body2">
                                {segment.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {segment.userCount} users •{" "}
                                {segment.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedSegment && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Selected segment will add{" "}
                        {
                          userSegments.find((s) => s.id === selectedSegment)
                            ?.userCount
                        }{" "}
                        recipients.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* CSV Upload */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <UploadIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">CSV Upload</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        Upload CSV File
                      </Button>

                      <Button
                        variant="text"
                        startIcon={<DownloadIcon />}
                        onClick={downloadSampleCsv}
                        fullWidth
                        size="small"
                      >
                        Download Sample CSV
                      </Button>
                    </Box>

                    {csvFile && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>{csvFile.name}</strong> uploaded successfully.
                          Found {recipients.length} recipients.
                        </Typography>
                      </Alert>
                    )}

                    {uploadError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {uploadError}
                      </Alert>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      CSV should contain columns: phone (required), name
                      (optional),
                      {template?.variables?.length
                        ? ` ${template.variables.join(", ")} (for template variables)`
                        : ""}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recipients Summary */}
            {recipients.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recipients Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {recipients.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Recipients
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="success.main">
                          {validRecipients.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Valid Numbers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="error.main">
                          {invalidRecipients.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Invalid Numbers
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Variables
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review and configure template variables for each recipient.
            </Typography>

            {template?.variables && template.variables.length > 0 ? (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  This template contains {template.variables.length}{" "}
                  variable(s): {template.variables.join(", ")}
                </Alert>

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Phone</TableCell>
                        <TableCell>Name</TableCell>
                        {template.variables.map((variable) => (
                          <TableCell key={variable}>{variable}</TableCell>
                        ))}
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validRecipients.slice(0, 50).map((recipient, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontFamily: "monospace" }}>
                            {recipient.phone}
                          </TableCell>
                          <TableCell>{recipient.name || "-"}</TableCell>
                          {template.variables!.map((variable) => (
                            <TableCell key={variable}>
                              <TextField
                                size="small"
                                value={recipient.variables?.[variable] || ""}
                                onChange={(e) =>
                                  updateRecipientVariable(
                                    index,
                                    variable,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Enter ${variable}`}
                                sx={{ minWidth: 120 }}
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeRecipient(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {validRecipients.length > 50 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Showing first 50 recipients. All {validRecipients.length}{" "}
                    recipients will be processed.
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                This template doesn't contain any variables. You can proceed to
                review and send.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Send
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your template and recipients before sending.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Template: {template?.name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={template?.status}
                        color={
                          template?.status === "approved"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                      <Chip
                        label={template?.category}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {template?.body}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recipients Summary
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Total Recipients:</strong>{" "}
                        {validRecipients.length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Template Variables:</strong>{" "}
                        {template?.variables?.length || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estimated Cost:</strong> $
                        {(validRecipients.length * 0.005).toFixed(2)}
                      </Typography>
                    </Box>

                    {invalidRecipients.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {invalidRecipients.length} invalid phone number(s) will
                        be skipped.
                      </Alert>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={useScheduling}
                          onChange={(e) => setUseScheduling(e.target.checked)}
                        />
                      }
                      label="Schedule for later"
                    />

                    {useScheduling && (
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Schedule Date & Time"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        sx={{ mt: 2 }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            Bulk Send Template: {template?.name}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>

        <Box sx={{ flex: "1 1 auto" }} />

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || validRecipients.length === 0}
            startIcon={<SendIcon />}
          >
            {loading
              ? "Sending..."
              : `Send to ${validRecipients.length} Recipients`}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && recipients.length === 0) ||
              (activeStep === 1 &&
                template?.variables?.length &&
                validRecipients.some((r) =>
                  template.variables!.some((v) => !r.variables?.[v]),
                ))
            }
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
