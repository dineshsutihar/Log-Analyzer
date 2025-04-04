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

export function renderAvatar(params) {
  if (params.value == null) {
    return "";
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: "24px",
        height: "24px",
        fontSize: "0.85rem",
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  { field: "id", headerName: "ID", flex: 0.5, minWidth: 50 },
  { field: "timeStamp", headerName: "Timestamp", flex: 1, minWidth: 100 },
  {
    field: "severity",
    headerName: "Severity",
    headerAlign: "center",
    align: "center",
    flex: 0.7,
    minWidth: 40,
    renderCell: (params) => renderSeverity(params.value),
  },
  {
    field: "users",
    headerName: "Users",
    headerAlign: "center",
    align: "center",
    flex: 0.7,
    minWidth: 40,
  },
  {
    field: "message",
    headerName: "Messages",
    headerAlign: "center",
    align: "left",
    flex: 2,
    minWidth: 200,
  },
  {
    field: "uploadDate",
    headerName: "Upload Date",
    headerAlign: "left",
    align: "left",
    flex: 0.5,
    minWidth: 120,
  },
  {
    field: "analyzed",
    headerName: "Analyzed",
    headerAlign: "center",
    align: "center",
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: "EventId",
    headerName: "Event ID/Process ID",
    headerAlign: "left",
    align: "left",
    flex: 0.5,
    minWidth: 100,
  },
];

export const rows = [
  {
    id: 1,
    timeStamp: "2025-04-01 08:15:23",
    severity: "ERROR",
    users: "dinesh",
    message: "System restart initiated",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2456",
    logType: "linux-kernel",
  },
  {
    id: 2,
    timeStamp: "2025-04-01 08:16:10",
    severity: "WARNING",
    users: "aashu",
    message: "Memory utilization ERROR",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2457",
    logType: "linux-auth",
  },
  {
    id: 3,
    timeStamp: "2025-04-01 08:17:05",
    severity: "INFO",
    users: "dinesh",
    message: "Disk space usage normal",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2458",
    logType: "window-app",
  },
  {
    id: 4,
    timeStamp: "2025-04-01 08:20:00",
    severity: "Critical",
    users: "root",
    message: "CPU overload",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2459",
    logType: "linux-sys",
  },
  {
    id: 5,
    timeStamp: "2025-04-01 08:22:30",
    severity: "ERROR",
    users: "aashu",
    message: "Network latency detected",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2460",
    logType: "linux-kernel",
  },
  {
    id: 6,
    timeStamp: "2025-04-01 08:25:01",
    severity: "WARNING",
    users: "dinesh",
    message: "Firewall access denied",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2461",
    logType: "linux-auth",
  },
  {
    id: 7,
    timeStamp: "2025-04-01 08:30:00",
    severity: "INFO",
    users: "aashu",
    message: "System idle",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2462",
    logType: "window-app",
  },
  {
    id: 8,
    timeStamp: "2025-04-01 08:35:10",
    severity: "ERROR",
    users: "dinesh",
    message: "Disk ERROR detected",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2463",
    logType: "linux-sys",
  },
  {
    id: 9,
    timeStamp: "2025-04-01 08:40:22",
    severity: "WARNING",
    users: "root",
    message: "Software update completed",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2464",
    logType: "linux-auth",
  },
  {
    id: 10,
    timeStamp: "2025-04-01 08:45:30",
    severity: "Critical",
    users: "dinesh",
    message: "System shutdown due to power failure",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2465",
    logType: "linux-kernel",
  },
  {
    id: 11,
    timeStamp: "2025-04-01 08:50:00",
    severity: "INFO",
    users: "aashu",
    message: "User login detected",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2466",
    logType: "window-app",
  },
  {
    id: 12,
    timeStamp: "2025-04-01 09:00:10",
    severity: "ERROR",
    users: "root",
    message: "Disk usage critical",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2467",
    logType: "linux-sys",
  },
  {
    id: 13,
    timeStamp: "2025-04-01 09:10:01",
    severity: "WARNING",
    users: "dinesh",
    message: "Memory leak detected",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2468",
    logType: "linux-auth",
  },
  {
    id: 14,
    timeStamp: "2025-04-01 09:20:30",
    severity: "INFO",
    users: "aashu",
    message: "System idle",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2469",
    logType: "window-app",
  },
  {
    id: 15,
    timeStamp: "2025-04-01 09:25:45",
    severity: "Critical",
    users: "root",
    message: "Unexpected system crash",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2470",
    logType: "linux-kernel",
  },
  {
    id: 16,
    timeStamp: "2025-04-01 09:30:00",
    severity: "WARNING",
    users: "dinesh",
    message: "CPU idle",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2471",
    logType: "linux-sys",
  },
  {
    id: 17,
    timeStamp: "2025-04-01 09:35:23",
    severity: "ERROR",
    users: "aashu",
    message: "Firewall breach detected",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2472",
    logType: "linux-auth",
  },
  {
    id: 18,
    timeStamp: "2025-04-01 09:40:00",
    severity: "Critical",
    users: "root",
    message: "Power supply failure",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2473",
    logType: "linux-kernel",
  },
  {
    id: 19,
    timeStamp: "2025-04-01 09:45:15",
    severity: "INFO",
    users: "dinesh",
    message: "Routine system check passed",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2474",
    logType: "window-app",
  },
  {
    id: 20,
    timeStamp: "2025-04-01 09:50:40",
    severity: "WARNING",
    users: "aashu",
    message: "Patch update installed",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2475",
    logType: "linux-sys",
  },
  {
    id: 21,
    timeStamp: "2025-04-01 09:55:01",
    severity: "INFO",
    users: "root",
    message: "User logout detected",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2476",
    logType: "linux-auth",
  },
  {
    id: 22,
    timeStamp: "2025-04-01 10:00:20",
    severity: "Critical",
    users: "dinesh",
    message: "Kernel panic detected",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2477",
    logType: "linux-kernel",
  },
  {
    id: 23,
    timeStamp: "2025-04-01 10:10:25",
    severity: "WARNING",
    users: "aashu",
    message: "Network latency issues",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2478",
    logType: "linux-sys",
  },
  {
    id: 24,
    timeStamp: "2025-04-01 10:15:10",
    severity: "ERROR",
    users: "root",
    message: "ERROR I/O operations detected",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2479",
    logType: "linux-auth",
  },
  {
    id: 25,
    timeStamp: "2025-04-01 10:20:45",
    severity: "INFO",
    users: "dinesh",
    message: "Scheduled task completed",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2480",
    logType: "window-app",
  },
  {
    id: 26,
    timeStamp: "2025-04-01 10:30:20",
    severity: "ERROR",
    users: "aashu",
    message: "Security breach detected",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2481",
    logType: "linux-kernel",
  },
  {
    id: 27,
    timeStamp: "2025-04-01 10:40:30",
    severity: "Critical",
    users: "root",
    message: "System shutdown due to ERROR",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2482",
    logType: "linux-sys",
  },
  {
    id: 28,
    timeStamp: "2025-04-01 10:45:10",
    severity: "INFO",
    users: "dinesh",
    message: "Routine log rotation",
    uploadDate: "2025-04-01",
    analyzed: false,
    EventId: "OS-2483",
    logType: "window-app",
  },
  {
    id: 29,
    timeStamp: "2025-04-01 10:50:00",
    severity: "WARNING",
    users: "aashu",
    message: "Memory usage increased",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2484",
    logType: "linux-auth",
  },
  {
    id: 30,
    timeStamp: "2025-04-01 10:55:25",
    severity: "Critical",
    users: "root",
    message: "Hard disk failure",
    uploadDate: "2025-04-01",
    analyzed: true,
    EventId: "OS-2485",
    logType: "linux-kernel",
  },
];
