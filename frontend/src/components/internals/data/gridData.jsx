import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

function renderSeverity(severity) {
  const colors = {
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
    SUCCESS: "success",
    CRITICAL: "secondary",
  };

  return <Chip label={severity} color={colors[severity]} size="small" />;
}

export const columns = [
  { field: "timeStamp", headerName: "Timestamp", flex: 0.8, minWidth: 100 },
  {
    field: "severity",
    headerName: "Severity",
    headerAlign: "center",
    align: "center",
    flex: 0.5,
    minWidth: 10,
    renderCell: (params) => renderSeverity(params.value),
  },
  // {
  //   field: "users",
  //   headerName: "Users",
  //   headerAlign: "center",
  //   align: "center",
  //   flex: 0.5,
  //   minWidth: 40,
  // },
  {
    field: "message",
    headerName: "Messages",
    headerAlign: "center",
    align: "left",
    flex: 2,
    minWidth: 200,
  },
  // {
  //   field: "uploadDate",
  //   headerName: "Upload Date",
  //   headerAlign: "left",
  //   align: "left",
  //   flex: 0.5,
  //   minWidth: 120,
  // },
  // {
  //   field: "analyzed",
  //   headerName: "Analyzed",
  //   headerAlign: "center",
  //   align: "center",
  //   flex: 0.5,
  //   minWidth: 100,
  // },
  {
    field: "EventId",
    headerName: "Event ID/Process ID",
    headerAlign: "left",
    align: "left",
    flex: 0.5,
    minWidth: 100,
  },
];
