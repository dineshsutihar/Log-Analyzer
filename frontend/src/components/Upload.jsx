import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

// Hidden input
const VisuallyHiddenInput = styled("input")({
  display: "none",
});

const DropArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: 10,
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: theme.palette.background.default,
  cursor: "pointer",
  transition: "border-color 0.3s",
  "&:hover": {
    borderColor: theme.palette.primary.dark,
  },
}));

const linuxLogTypes = [
  { value: "syslog.log", label: "System Log (syslog.log)" },
  { value: "kernel.log", label: "Kernel Log (kernel.log)" },
  { value: "auth.log", label: "Authentication Log (auth.log)" },
  { value: "other", label: "Other Log File" },
];

const Upload = () => {
  const [osType, setOsType] = useState("windows");
  const [linuxLogType, setLinuxLogType] = useState("syslog.log");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleOsChange = (event) => {
    setOsType(event.target.value);
    setSelectedFile(null);
    setUploadStatus(null);
  };

  const handleLogTypeChange = (event) => {
    setLinuxLogType(event.target.value);
  };

  const handleFileChange = (file) => {
    const isValid =
      (osType === "windows" && file.name.toLowerCase().endsWith(".csv")) ||
      (osType === "linux" && file.name.toLowerCase().endsWith(".log"));

    if (!isValid) {
      setUploadStatus({
        type: "error",
        message: `Please select a valid ${
          osType === "windows" ? "CSV" : "LOG"
        } file.`,
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        type: "error",
        message: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("logfile", selectedFile);
      formData.append("source", osType === "linux" ? linuxLogType : "csv");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api//upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error(`Upload failed with status: ${response.status}`);

      setUploadStatus({
        type: "success",
        message: "File uploaded successfully!",
      });

      // Add logic for additional questions here (after successful upload)
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ px: 2, maxWidth: 720, mx: "auto", mt: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Log File Upload
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl>
          <Typography variant="subtitle1" gutterBottom>
            Select Operating System:
          </Typography>
          <RadioGroup row value={osType} onChange={handleOsChange}>
            <FormControlLabel
              value="windows"
              control={<Radio />}
              label="Windows"
            />
            <FormControlLabel value="linux" control={<Radio />} label="Linux" />
          </RadioGroup>
        </FormControl>
      </Box>

      {osType === "linux" && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Select Log Type:
            </Typography>
            <Select value={linuxLogType} onChange={handleLogTypeChange}>
              {linuxLogTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the type of log file</FormHelperText>
          </FormControl>
        </Box>
      )}

      <DropArea
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{ mb: 3 }}
        onClick={() => document.getElementById("hiddenFileInput")?.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
        <Typography variant="subtitle1" mt={2}>
          Drag & drop your {osType === "windows" ? "CSV" : "LOG"} file here,
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to select a file
        </Typography>
        <VisuallyHiddenInput
          id="hiddenFileInput"
          type="file"
          accept={osType === "windows" ? ".csv" : ".log"}
          onChange={handleFileInputChange}
        />
      </DropArea>

      {selectedFile && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected file: <strong>{selectedFile.name}</strong>
        </Typography>
      )}

      <Box textAlign="center" mb={2}>
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Upload"
          )}
        </Button>
      </Box>

      {uploadStatus && (
        <Alert severity={uploadStatus.type} sx={{ borderRadius: 1 }}>
          {uploadStatus.message}
        </Alert>
      )}
    </Box>
  );
};

export default Upload;
