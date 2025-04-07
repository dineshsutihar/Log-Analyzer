import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";

export default function LogDetailsDialog({ selectedRow, onClose }) {
  if (!selectedRow) return null;

  // Helper function to format values based on type
  const formatValue = (key, value) => {
    if (value === null || value === undefined) {
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontStyle: "italic" }}
        >
          None
        </Typography>
      );
    } else if (typeof value === "object") {
      return (
        <Box
          component="pre"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            maxHeight: 200,
            fontSize: "0.875rem",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Box>
      );
    } else if (typeof value === "boolean") {
      return <Typography variant="body2">{value ? "Yes" : "No"}</Typography>;
    } else if (
      key.toLowerCase().includes("time") ||
      key.toLowerCase().includes("date")
    ) {
      try {
        return (
          <Typography variant="body2">
            {new Date(value).toLocaleString()}
          </Typography>
        );
      } catch {
        return <Typography variant="body2">{value}</Typography>;
      }
    }
    return <Typography variant="body2">{value}</Typography>;
  };

  // Convert key strings to a more readable format
  const formatLabel = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Prepare entries from the selected row
  const entries = Object.entries(selectedRow).map(([key, value]) => ({
    key,
    value,
    isWide: typeof value === "object",
  }));

  return (
    <Dialog
      open={Boolean(selectedRow)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.light",
          color: "white",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Log Details #{selectedRow.id}
        </Typography>
        {/* Conditionally render the Chat button if analyzed is false */}
        {selectedRow.analyzed === false && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ChatIcon />}
            sx={{ mr: 2 }}
          >
            Chat
          </Button>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {entries.map(({ key, value, isWide }) => (
            <Grid item xs={12} md={isWide ? 12 : 6} key={key}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  boxShadow: (theme) => theme.shadows[1],
                  height: "100%",
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.secondary" }}
                  >
                    {formatLabel(key)}
                  </Typography>
                  {formatValue(key, value)}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
