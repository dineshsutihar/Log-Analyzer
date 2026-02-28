import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Alert,
  Button,
  Skeleton,
  Paper,
  Tooltip,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportIcon from "@mui/icons-material/BugReport";
import TimelineIcon from "@mui/icons-material/Timeline";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RepeatIcon from "@mui/icons-material/Repeat";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAuth } from "@clerk/clerk-react";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";
import { fetchInsights } from "../utils/api/healthInsights";

// --- No Data State ---
function NoDataState() {
  const [, setActiveView] = useRecoilState(activeViewState);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        textAlign: "center",
      }}
    >
      <TroubleshootIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Insights Yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 440 }}>
        Upload system logs to unlock automatic pattern detection, anomaly alerts,
        and intelligent recommendations.
      </Typography>
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => setActiveView("upload")}
        size="large"
      >
        Upload Logs to Get Started
      </Button>
    </Box>
  );
}

// --- Anomaly Card ---
function AnomalyCard({ anomaly }) {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderLeft: 3,
        borderLeftColor:
          anomaly.zScore > 3
            ? "error.main"
            : anomaly.zScore > 2
            ? "warning.main"
            : "info.main",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {new Date(anomaly.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {anomaly.count} errors • z-score: {anomaly.zScore}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={
            anomaly.zScore > 3
              ? "High Spike"
              : anomaly.zScore > 2
              ? "Moderate Spike"
              : "Mild Spike"
          }
          color={
            anomaly.zScore > 3
              ? "error"
              : anomaly.zScore > 2
              ? "warning"
              : "info"
          }
          variant="outlined"
        />
      </Stack>
    </Paper>
  );
}

// --- Main Component ---
export default function LogInsights() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const result = await fetchInsights(token);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography component="h2" variant="h6">Log Insights</Typography>
        </Stack>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="40%" height={28} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 1, borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={loadData}>Retry</Button>}
        >
          Failed to load insights: {error}
        </Alert>
      </Box>
    );
  }

  // Check if there's meaningful data
  const hasData =
    data &&
    (data.recurring?.length > 0 ||
      data.anomalies?.length > 0 ||
      data.severityTimeline?.length > 0);

  if (!hasData) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Log Insights
        </Typography>
        <Card variant="outlined">
          <NoDataState />
        </Card>
      </Box>
    );
  }

  // Prepare hourly distribution chart
  const hourLabels = data.hourlyDistribution.map((h) =>
    `${h.hour.toString().padStart(2, "0")}:00`
  );
  const hourCounts = data.hourlyDistribution.map((h) => h.count);

  // Prepare severity timeline
  const timelineDates = data.severityTimeline.map((t) => new Date(t.date));
  const timelineErrors = data.severityTimeline.map((t) => t.errors);
  const timelineWarnings = data.severityTimeline.map((t) => t.warnings);
  const timelineInfo = data.severityTimeline.map((t) => t.info);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography component="h2" variant="h6">
          Log Insights
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadData} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Summary Banner */}
      {data.summary && (
        <Alert
          severity="info"
          icon={<TroubleshootIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">{data.summary}</Typography>
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Severity Timeline */}
        {timelineDates.length > 2 && (
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TimelineIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2">
                    Severity Timeline (30 days)
                  </Typography>
                </Stack>
                <Box sx={{ width: "100%", height: 250 }}>
                  <LineChart
                    xAxis={[
                      {
                        data: timelineDates,
                        scaleType: "time",
                        tickLabelStyle: { fontSize: 11 },
                      },
                    ]}
                    series={[
                      {
                        data: timelineErrors,
                        label: "Errors",
                        color: theme.palette.error.main,
                        showMark: false,
                        area: true,
                      },
                      {
                        data: timelineWarnings,
                        label: "Warnings",
                        color: theme.palette.warning.main,
                        showMark: false,
                        area: true,
                      },
                      {
                        data: timelineInfo,
                        label: "Info",
                        color: theme.palette.info.main,
                        showMark: false,
                        area: true,
                      },
                    ]}
                    height={250}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Hourly Error Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <BugReportIcon fontSize="small" color="error" />
                <Typography variant="subtitle2">
                  Error Hotspot Hours
                </Typography>
              </Stack>
              {data.peakErrorHour !== null && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Peak errors at{" "}
                  <strong>{data.peakErrorHour.toString().padStart(2, "0")}:00 UTC</strong>
                </Typography>
              )}
              <Box sx={{ width: "100%", height: 200 }}>
                <BarChart
                  xAxis={[
                    {
                      data: hourLabels,
                      scaleType: "band",
                      tickLabelStyle: { fontSize: 9 },
                    },
                  ]}
                  series={[
                    {
                      data: hourCounts,
                      label: "Errors",
                      color: theme.palette.error.main,
                    },
                  ]}
                  height={200}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  slotProps={{ legend: { hidden: true } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Anomaly Detection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <NotificationsActiveIcon fontSize="small" color="warning" />
                <Typography variant="subtitle2">
                  Anomaly Detection
                </Typography>
                {data.anomalies.length > 0 && (
                  <Chip label={`${data.anomalies.length} detected`} size="small" color="warning" variant="outlined" />
                )}
              </Stack>
              {data.anomalies.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No anomalous error spikes detected. System behavior is consistent.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 240, overflowY: "auto" }}>
                  {data.anomalies.slice(0, 5).map((anomaly, i) => (
                    <AnomalyCard key={i} anomaly={anomaly} />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recurring Errors */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <RepeatIcon fontSize="small" color="error" />
                <Typography variant="subtitle2">
                  Recurring Errors
                </Typography>
              </Stack>
              {data.recurring.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No recurring error patterns found.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto" }}>
                  {data.recurring.map((err, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 0.5,
                        }}
                      >
                        {err.message}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          label={`${err.count}×`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                        <Chip label={err.severity} size="small" color={err.severity === "CRITICAL" ? "error" : "warning"} />
                        {err.logType && (
                          <Chip label={err.logType} size="small" variant="outlined" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Last:{" "}
                          {new Date(err.lastSeen).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Error Sources + Burst Detection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Error Sources
              </Typography>
              {data.errorsBySource.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No error sources identified.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {data.errorsBySource.slice(0, 5).map((src, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        py: 0.5,
                        borderBottom: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {src.source}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {src.count}
                        </Typography>
                        {src.criticalCount > 0 && (
                          <Chip
                            label={`${src.criticalCount} critical`}
                            size="small"
                            color="error"
                          />
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}

              {/* Bursts */}
              {data.bursts && data.bursts.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Error Bursts
                  </Typography>
                  <Stack spacing={1}>
                    {data.bursts.map((burst, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {burst.date} • {burst.timeWindow}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {burst.count} errors in 4-hour window
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
