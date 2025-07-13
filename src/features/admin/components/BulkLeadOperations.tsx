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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  GetApp as GetAppIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Campaign,
  DynamicForm,
  Lead,
  LeadFilter,
  BulkUploadResult,
} from "../types";

interface BulkLeadOperationsProps {
  // Upload props
  uploadOpen: boolean;
  onUploadClose: () => void;
  campaigns: Campaign[];
  dynamicForms: DynamicForm[];
  onBulkUpload: (
    file: File,
    campaignId: string,
    fieldMapping: Record<string, string>,
  ) => Promise<BulkUploadResult>;

  // Download props
  downloadOpen: boolean;
  onDownloadClose: () => void;
  leads: Lead[];
  appliedFilters: LeadFilter;
  onBulkDownload: (
    format: "csv" | "excel",
    filters: LeadFilter,
    fields: string[],
  ) => void;
}

const uploadSteps = ["Select Campaign & File", "Map Fields", "Review & Upload"];

export default function BulkLeadOperations({
  uploadOpen,
  onUploadClose,
  campaigns,
  dynamicForms,
  onBulkUpload,
  downloadOpen,
  onDownloadClose,
  leads,
  appliedFilters,
  onBulkDownload,
}: BulkLeadOperationsProps) {
  // Upload state
  const [uploadStep, setUploadStep] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  // Download state
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "excel">("csv");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadReset = () => {
    setUploadStep(0);
    setSelectedCampaign("");
    setUploadFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setUploadResult(null);
    setUploading(false);
  };

  const handleUploadClose = () => {
    handleUploadReset();
    onUploadClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setUploadFile(file);

    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must contain headers and at least one data row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(data);
    };

    reader.readAsText(file);
  };

  const getSelectedForm = () => {
    const campaign = campaigns.find((c) => c.id === selectedCampaign);
    return campaign ? dynamicForms.find((f) => f.id === campaign.formId) : null;
  };

  const handleNext = () => {
    if (uploadStep === 0 && (!selectedCampaign || !uploadFile)) {
      alert("Please select a campaign and upload a file");
      return;
    }
    if (uploadStep === 1) {
      // Auto-map fields based on name similarity
      const form = getSelectedForm();
      if (form) {
        const mapping: Record<string, string> = {};
        form.fields.forEach((field) => {
          const matchingHeader = csvHeaders.find(
            (header) =>
              header.toLowerCase().includes(field.name.toLowerCase()) ||
              field.name.toLowerCase().includes(header.toLowerCase()),
          );
          if (matchingHeader) {
            mapping[matchingHeader] = field.name;
          }
        });
        setFieldMapping(mapping);
      }
    }
    setUploadStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setUploadStep((prev) => prev - 1);
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedCampaign) return;

    try {
      setUploading(true);
      const result = await onBulkUpload(
        uploadFile,
        selectedCampaign,
        fieldMapping,
      );
      setUploadResult(result);
      setUploadStep(3); // Move to results step
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFieldMappingChange = (csvField: string, formField: string) => {
    setFieldMapping((prev) => ({
      ...prev,
      [csvField]: formField,
    }));
  };

  const downloadSampleCsv = () => {
    const form = getSelectedForm();
    if (!form) return;

    const headers = form.fields.map((field) => field.name);
    const sampleRow = form.fields.map((field) => {
      switch (field.type) {
        case "phone":
          return "+1234567890";
        case "email":
          return "sample@example.com";
        case "text":
          return "Sample Text";
        case "number":
          return "123";
        case "date":
          return "2024-01-01";
        case "select":
          return field.options?.[0] || "Option1";
        default:
          return "Sample Value";
      }
    });

    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${form.name}_template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export");
      return;
    }

    try {
      setDownloading(true);
      await onBulkDownload(downloadFormat, appliedFilters, selectedFields);
      setTimeout(() => {
        setDownloading(false);
        onDownloadClose();
      }, 2000);
    } catch (error) {
      setDownloading(false);
      alert("Download failed. Please try again.");
    }
  };

  const getAllAvailableFields = () => {
    const fieldsSet = new Set<string>();
    leads.forEach((lead) => {
      fieldsSet.add("phoneNumber");
      fieldsSet.add("status");
      fieldsSet.add("priority");
      fieldsSet.add("source");
      fieldsSet.add("campaignName");
      fieldsSet.add("assignedTo");
      fieldsSet.add("createdDate");
      Object.keys(lead.data).forEach((key) => fieldsSet.add(key));
    });
    return Array.from(fieldsSet);
  };

  const renderUploadStep = () => {
    switch (uploadStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Campaign and Upload File
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Campaign</InputLabel>
              <Select
                value={selectedCampaign}
                label="Select Campaign"
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    <Box>
                      <Typography variant="body2">{campaign.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Form: {campaign.formName || "No form assigned"}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCampaign && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSampleCsv}
                  sx={{ mb: 2 }}
                >
                  Download Template CSV
                </Button>
                <Alert severity="info">
                  Download the template CSV to see the required format for your
                  campaign's form.
                </Alert>
              </Box>
            )}

            <Box>
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
                sx={{ mb: 2 }}
              >
                Upload CSV File
              </Button>

              {uploadFile && (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>{uploadFile.name}</strong> uploaded successfully.
                    Found {csvData.length} records with {csvHeaders.length}{" "}
                    columns.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Box>
        );

      case 1:
        const form = getSelectedForm();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map CSV Fields to Form Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Map your CSV columns to the corresponding form fields.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  CSV Columns ({csvHeaders.length})
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto" }}>
                  {csvHeaders.map((header) => (
                    <Chip
                      key={header}
                      label={header}
                      variant="outlined"
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Form Fields ({form?.fields.length || 0})
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto" }}>
                  {form?.fields.map((field) => (
                    <Chip
                      key={field.id}
                      label={`${field.label} (${field.type})`}
                      color={field.isSystem ? "primary" : "default"}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
              Field Mapping
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>CSV Column</TableCell>
                    <TableCell>Maps To Form Field</TableCell>
                    <TableCell>Sample Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvHeaders.map((header) => (
                    <TableRow key={header}>
                      <TableCell>{header}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={fieldMapping[header] || ""}
                            onChange={(e) =>
                              handleFieldMappingChange(header, e.target.value)
                            }
                          >
                            <MenuItem value="">
                              <em>Don't import</em>
                            </MenuItem>
                            {form?.fields.map((field) => (
                              <MenuItem key={field.id} value={field.name}>
                                {field.label} ({field.type})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {csvData[0]?.[header] || "No data"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review and Upload
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Upload Summary
                    </Typography>
                    <Typography variant="body2">
                      <strong>Campaign:</strong>{" "}
                      {campaigns.find((c) => c.id === selectedCampaign)?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>File:</strong> {uploadFile?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Records:</strong> {csvData.length}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Mapped Fields:</strong>{" "}
                      {
                        Object.keys(fieldMapping).filter((k) => fieldMapping[k])
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Field Mapping
                    </Typography>
                    {Object.entries(fieldMapping)
                      .filter(([, formField]) => formField)
                      .map(([csvField, formField]) => (
                        <Typography key={csvField} variant="body2">
                          {csvField} → {formField}
                        </Typography>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Results
            </Typography>

            {uploadResult && (
              <Box>
                <Alert
                  severity={
                    uploadResult.status === "completed"
                      ? "success"
                      : uploadResult.status === "failed"
                        ? "error"
                        : "info"
                  }
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body2">
                    Upload {uploadResult.status}. {uploadResult.successCount} of{" "}
                    {uploadResult.totalRecords} records imported successfully.
                  </Typography>
                </Alert>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <CheckCircleIcon
                          color="success"
                          sx={{ fontSize: 40, mb: 1 }}
                        />
                        <Typography variant="h6">
                          {uploadResult.successCount}
                        </Typography>
                        <Typography variant="caption">Successful</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">
                          {uploadResult.errorCount}
                        </Typography>
                        <Typography variant="caption">Errors</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <InfoIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">
                          {uploadResult.totalRecords}
                        </Typography>
                        <Typography variant="caption">Total</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {uploadResult.errors.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        View Errors ({uploadResult.errors.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Row</TableCell>
                              <TableCell>Field</TableCell>
                              <TableCell>Error</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {uploadResult.errors.map((error, index) => (
                              <TableRow key={index}>
                                <TableCell>{error.row}</TableCell>
                                <TableCell>{error.field}</TableCell>
                                <TableCell>{error.message}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Bulk Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onClose={handleUploadClose}
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
            <Typography variant="h6">Bulk Upload Leads</Typography>
            <IconButton onClick={handleUploadClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={uploadStep} alternativeLabel>
              {uploadSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {uploading && <LinearProgress sx={{ mb: 2 }} />}

          {renderUploadStep()}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button disabled={uploadStep === 0} onClick={handleBack}>
            Back
          </Button>

          <Box sx={{ flex: "1 1 auto" }} />

          {uploadStep === uploadSteps.length - 1 ? (
            <Button variant="contained" onClick={handleUploadClose}>
              Close
            </Button>
          ) : uploadStep === 2 ? (
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={<CloudUploadIcon />}
            >
              {uploading ? "Uploading..." : "Upload Leads"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={uploadStep === 0 && (!selectedCampaign || !uploadFile)}
            >
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Download Dialog */}
      <Dialog
        open={downloadOpen}
        onClose={onDownloadClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Export Leads</Typography>
            <IconButton onClick={onDownloadClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Export {leads.length} leads with current filters applied.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={downloadFormat}
                  label="Export Format"
                  onChange={(e) =>
                    setDownloadFormat(e.target.value as "csv" | "excel")
                  }
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Fields to Export
              </Typography>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto" }}>
                <Grid container>
                  {getAllAvailableFields().map((field) => (
                    <Grid item xs={6} sm={4} key={field}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          id={field}
                          checked={selectedFields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFields((prev) => [...prev, field]);
                            } else {
                              setSelectedFields((prev) =>
                                prev.filter((f) => f !== field),
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={field}
                          style={{ marginLeft: 8, fontSize: 14 }}
                        >
                          {field}
                        </label>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setSelectedFields(getAllAvailableFields())}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSelectedFields([])}
                    sx={{ ml: 1 }}
                  >
                    Clear All
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {downloading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preparing your export...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onDownloadClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={downloading || selectedFields.length === 0}
            startIcon={<GetAppIcon />}
          >
            {downloading
              ? "Exporting..."
              : `Export ${downloadFormat.toUpperCase()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
