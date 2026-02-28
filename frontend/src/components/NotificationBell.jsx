import React, { useState, useEffect, useCallback } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "@clerk/clerk-react";
import { fetchHealthScore } from "../utils/api/healthInsights";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const { getToken } = useAuth();
  const [, setActiveView] = useRecoilState(activeViewState);

  const generateAlerts = useCallback(async () => {
    try {
      const token = await getToken();
      const health = await fetchHealthScore(token);

      if (!health || health.status === "no-data") {
        setAlerts([]);
        return;
      }

      const newAlerts = [];
      const now = new Date();

      // Critical score alert
      if (health.score < 50) {
        newAlerts.push({
          id: "low-health",
          type: "error",
          icon: <ErrorOutlineIcon color="error" />,
          title: "System Health Critical",
          message: `Health score is ${health.score}/100. Immediate attention needed.`,
          time: now,
          action: "health",
        });
      } else if (health.score < 75) {
        newAlerts.push({
          id: "fair-health",
          type: "warning",
          icon: <WarningAmberIcon color="warning" />,
          title: "System Health Degraded",
          message: `Health score is ${health.score}/100. Review recommendations.`,
          time: now,
          action: "health",
        });
      }

      // Degrading trend alert
      if (health.trendDirection === "degrading") {
        newAlerts.push({
          id: "degrading-trend",
          type: "warning",
          icon: <TrendingDownIcon color="warning" />,
          title: "Error Rate Increasing",
          message: "Error rate is trending up compared to last week.",
          time: now,
          action: "insights",
        });
      }

      // Critical logs exist
      if (health.last24h?.critical > 0) {
        newAlerts.push({
          id: "critical-24h",
          type: "error",
          icon: <ErrorOutlineIcon color="error" />,
          title: `${health.last24h.critical} Critical Event${health.last24h.critical > 1 ? "s" : ""} (24h)`,
          message: "New critical log entries detected in the last 24 hours.",
          time: now,
          action: "analytics",
        });
      }

      // High error volume
      if (health.last24h?.error > 50) {
        newAlerts.push({
          id: "high-errors",
          type: "warning",
          icon: <WarningAmberIcon color="warning" />,
          title: "High Error Volume",
          message: `${health.last24h.error} errors in the last 24 hours.`,
          time: now,
          action: "analytics",
        });
      }

      // Improving trend (good news)
      if (health.trendDirection === "improving" && health.score >= 75) {
        newAlerts.push({
          id: "improving",
          type: "success",
          icon: <CheckCircleOutlineIcon color="success" />,
          title: "System Improving",
          message: "Error rate is trending down. Great progress!",
          time: now,
          action: "health",
        });
      }

      setAlerts(newAlerts);
    } catch {
      // Silently fail — notification is non-critical
    }
  }, [getToken]);

  useEffect(() => {
    generateAlerts();
    const interval = setInterval(generateAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [generateAlerts]);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));
  const unreadCount = visibleAlerts.filter(
    (a) => a.type === "error" || a.type === "warning"
  ).length;

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const handleAlertClick = (action) => {
    setAnchorEl(null);
    if (action) setActiveView(action);
  };

  return (
    <>
      <Tooltip title={unreadCount > 0 ? `${unreadCount} alert(s)` : "No alerts"}>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ position: "relative" }}
        >
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { width: 360, maxHeight: 420, borderRadius: 2 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Alerts
            </Typography>
            {visibleAlerts.length > 0 && (
              <Button
                size="small"
                onClick={() =>
                  setDismissed(new Set(alerts.map((a) => a.id)))
                }
              >
                Dismiss all
              </Button>
            )}
          </Stack>
        </Box>
        <Divider />
        {visibleAlerts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 40, color: "success.main", opacity: 0.6, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              All clear — no alerts right now
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {visibleAlerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    cursor: alert.action ? "pointer" : "default",
                    "&:hover": { bgcolor: "action.hover" },
                    py: 1.5,
                    px: 2,
                  }}
                  onClick={() => handleAlertClick(alert.action)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(alert.id);
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ✕
                      </Typography>
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {alert.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {alert.title}
                      </Typography>
                    }
                    secondary={alert.message}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
