import * as React from "react";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

function renderSeverity(severity) {
  const colors = {
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
    SUCCESS: "success",
    CRITICAL: "secondary",
  };

  return <Chip label={severity} color={colors[severity] || "default"} size="small" />;
}

function renderAnalyzed(value) {
  return value ? (
    <CheckCircleOutlineIcon color="success" fontSize="small" />
  ) : (
    <HighlightOffIcon color="disabled" fontSize="small" />
  );
}

/**
 * Returns a bookmark column that calls `onToggle(rowId)` when clicked.
 */
export function bookmarkColumn(onToggle) {
  return {
    field: "bookmarked",
    headerName: "",
    width: 50,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const isBookmarked = params.value;
      return (
        <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark this log"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(params.row.id);
            }}
            sx={{ color: isBookmarked ? "warning.main" : "action.disabled" }}
          >
            {isBookmarked ? (
              <BookmarkIcon fontSize="small" />
            ) : (
              <BookmarkBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      );
    },
  };
}

export const columns = [
  {
    field: "timeStamp",
    headerName: "Timestamp",
    flex: 0.8,
    minWidth: 150,
    valueFormatter: (value) => {
      if (!value) return "";
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    },
  },
  {
    field: "severity",
    headerName: "Severity",
    headerAlign: "center",
    align: "center",
    flex: 0.4,
    minWidth: 100,
    renderCell: (params) => renderSeverity(params.value),
  },
  {
    field: "message",
    headerName: "Message",
    headerAlign: "left",
    align: "left",
    flex: 2,
    minWidth: 200,
  },
  {
    field: "logType",
    headerName: "Log Type",
    headerAlign: "center",
    align: "center",
    flex: 0.4,
    minWidth: 100,
  },
  {
    field: "EventId",
    headerName: "Event / Process ID",
    headerAlign: "left",
    align: "left",
    flex: 0.4,
    minWidth: 100,
  },
  {
    field: "uploadDate",
    headerName: "Uploaded",
    headerAlign: "left",
    align: "left",
    flex: 0.5,
    minWidth: 120,
    valueFormatter: (value) => {
      if (!value) return "";
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    },
  },
  {
    field: "analyzed",
    headerName: "Analyzed",
    headerAlign: "center",
    align: "center",
    flex: 0.3,
    minWidth: 80,
    renderCell: (params) => renderAnalyzed(params.value),
  },
];
