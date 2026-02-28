import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ToggleButton from "@mui/material/ToggleButton";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteIcon from "@mui/icons-material/Delete";
import { columns as baseColumns, bookmarkColumn } from "./internals/data/gridData";
import fetchAllLogs from "../utils/api/fetchLogAnalytics";
import { deleteLog, bulkDeleteLogs } from "../utils/api/logManagement";
import LogDetailsDialog from "./LogDetailsDialog";
import { useAuth } from "@clerk/clerk-react";

function DataGridSkeleton() {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stack spacing={1}>
        {/* Header row */}
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        {/* Data rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={36}
            sx={{ borderRadius: 0.5, opacity: 1 - i * 0.08 }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default function CustomizedDataGrid({
  severityFilter = "",
  logTypeFilter = "",
  startDate = "",
  endDate = "",
}) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [selectLogMessage, setSelectLogMessage] =
    React.useState("No data available");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [deleting, setDeleting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { getToken } = useAuth();

  // ---- Bookmark state (persisted in localStorage) ----
  const BOOKMARK_KEY = "log_bookmarks";
  const [bookmarkedIds, setBookmarkedIds] = React.useState(() => {
    try {
      const stored = localStorage.getItem(BOOKMARK_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showBookmarkedOnly, setShowBookmarkedOnly] = React.useState(false);

  const toggleBookmark = React.useCallback((id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Build columns with bookmark column prepended
  const columnsWithBookmark = React.useMemo(
    () => [bookmarkColumn(toggleBookmark), ...baseColumns],
    [toggleBookmark]
  );

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await fetchAllLogs(token);
      if (!data) {
        throw new Error("No data found");
      }
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter rows client-side based on props
  const filteredRows = React.useMemo(() => {
    // Inject bookmarked field
    let result = rows.map((r) => ({
      ...r,
      bookmarked: bookmarkedIds.has(r.id),
    }));
    if (showBookmarkedOnly) {
      result = result.filter((r) => r.bookmarked);
    }
    if (severityFilter) {
      result = result.filter(
        (r) => r.severity?.toUpperCase() === severityFilter.toUpperCase()
      );
    }
    if (logTypeFilter) {
      result = result.filter(
        (r) => r.logType?.toUpperCase() === logTypeFilter.toUpperCase()
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => {
        const ts = new Date(r.timeStamp || r.uploadDate);
        return ts >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => {
        const ts = new Date(r.timeStamp || r.uploadDate);
        return ts <= end;
      });
    }
    return result;
  }, [rows, severityFilter, logTypeFilter, startDate, endDate, bookmarkedIds, showBookmarkedOnly]);

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    setSelectLogMessage(params.row.message);
  };

  const handleCloseOverlay = () => {
    setSelectedRow(null);
    setSelectLogMessage("No data available");
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setDeleting(true);
      const token = await getToken();
      if (selectedIds.length === 1) {
        await deleteLog(selectedIds[0], token);
      } else {
        await bulkDeleteLogs(selectedIds, token);
      }
      setRows((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setSnackbar({
        open: true,
        message: `Deleted ${selectedIds.length} log(s) successfully`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Delete failed: ${err.message}`,
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <DataGridSkeleton />;
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        }
      >
        Failed to load logs: {error}
      </Alert>
    );
  }

  return (
    <>
      {/* Toolbar: bookmark filter + selection actions */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Tooltip title={showBookmarkedOnly ? "Show all logs" : "Show bookmarked only"}>
          <ToggleButton
            value="bookmarked"
            selected={showBookmarkedOnly}
            onChange={() => setShowBookmarkedOnly((v) => !v)}
            size="small"
            sx={{ border: "none", px: 1.5 }}
          >
            <BookmarkIcon
              fontSize="small"
              sx={{ mr: 0.5, color: showBookmarkedOnly ? "warning.main" : "action.disabled" }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {bookmarkedIds.size > 0
                ? `Bookmarked (${bookmarkedIds.size})`
                : "Bookmarked"}
            </Typography>
          </ToggleButton>
        </Tooltip>

        {selectedIds.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              ml: "auto",
              p: 0.5,
              px: 1.5,
              bgcolor: "action.selected",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedIds.length} selected
            </Typography>
            <Tooltip title="Delete selected logs">
              <IconButton
                color="error"
                size="small"
                onClick={handleDeleteSelected}
                disabled={deleting}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columnsWithBookmark}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newSelection) =>
          setSelectedIds(newSelection)
        }
        rowSelectionModel={selectedIds}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 20, 50, 100]}
        density="standard"
        rowHeight={48}
        autoHeight
        onRowClick={handleRowClick}
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: "outlined",
                size: "small",
              },
              columnInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              operatorInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: "outlined",
                  size: "small",
                },
              },
            },
          },
        }}
      />

      <LogDetailsDialog
        selectedRow={selectedRow}
        onClose={handleCloseOverlay}
        logMessage={selectLogMessage}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
