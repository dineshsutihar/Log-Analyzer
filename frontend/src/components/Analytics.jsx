import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CustomizedDataGrid from "./CustomizedDataGrid";
import { exportLogs } from "../utils/api/logManagement";
import { useAuth } from "@clerk/clerk-react";

export default function Analytics() {
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("");
  const [logTypeFilter, setLogTypeFilter] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const token = await getToken();
      await exportLogs(
        {
          severity: severityFilter || undefined,
          logType: logTypeFilter || undefined,
        },
        format,
        token
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography component="h2" variant="h6">
          Log Analytics
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <ButtonGroup variant="outlined" size="small" disabled={exporting}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleExport("csv")}
            >
              CSV
            </Button>
            <Button onClick={() => handleExport("json")}>JSON</Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* Filter Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={severityFilter}
            label="Severity"
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="INFO">Info</MenuItem>
            <MenuItem value="WARNING">Warning</MenuItem>
            <MenuItem value="ERROR">Error</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Log Type</InputLabel>
          <Select
            value={logTypeFilter}
            label="Log Type"
            onChange={(e) => setLogTypeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="WINDOWS">Windows</MenuItem>
            <MenuItem value="SYSLOG">Syslog</MenuItem>
            <MenuItem value="AUTH">Auth</MenuItem>
            <MenuItem value="KERNEL">Kernel</MenuItem>
          </Select>
        </FormControl>
        {(severityFilter || logTypeFilter) && (
          <Chip
            label="Clear filters"
            onDelete={() => {
              setSeverityFilter("");
              setLogTypeFilter("");
            }}
            size="small"
            sx={{ alignSelf: "center" }}
          />
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomizedDataGrid
            key={refreshKey}
            severityFilter={severityFilter}
            logTypeFilter={logTypeFilter}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
