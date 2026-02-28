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
  LinearProgress,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAuth } from "@clerk/clerk-react";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";
import { fetchHealthScore } from "../utils/api/healthInsights";

// --- Health Score Gauge ---
function HealthGauge({ score, status }) {
  const theme = useTheme();

  const getColor = () => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    if (score >= 25) return theme.palette.error.light;
    return theme.palette.error.main;
  };

  const getStatusLabel = () => {
    const labels = {
      excellent: "Excellent",
      good: "Good",
      fair: "Needs Attention",
      poor: "Poor",
      critical: "Critical",
    };
    return labels[status] || status;
  };

  const getStatusIcon = () => {
    if (score >= 75)
      return <CheckCircleOutlineIcon sx={{ fontSize: 20, color: getColor() }} />;
    if (score >= 50)
      return <WarningAmberIcon sx={{ fontSize: 20, color: getColor() }} />;
    return <ErrorOutlineIcon sx={{ fontSize: 20, color: getColor() }} />;
  };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Box sx={{ textAlign: "center", position: "relative", p: 2 }}>
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <svg width="140" height="140" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={theme.palette.divider}
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
          {/* Center text */}
          <text
            x="60"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fill={theme.palette.text.primary}
            fontSize="28"
            fontWeight="700"
          >
            {score}
          </text>
          <text
            x="60"
            y="78"
            textAnchor="middle"
            dominantBaseline="central"
            fill={theme.palette.text.secondary}
            fontSize="10"
          >
            / 100
          </text>
        </svg>
      </Box>
      <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 1 }}>
        {getStatusIcon()}
        <Typography variant="subtitle2" sx={{ color: getColor(), fontWeight: 600 }}>
          {getStatusLabel()}
        </Typography>
      </Stack>
    </Box>
  );
}

// --- Severity Breakdown Bar ---
function SeverityBreakdown({ breakdown }) {
  const theme = useTheme();
  const total = breakdown.total || 1;

  const segments = [
    { label: "Info", value: breakdown.info, color: theme.palette.info.main },
    { label: "Warning", value: breakdown.warning, color: theme.palette.warning.main },
    { label: "Error", value: breakdown.error, color: theme.palette.error.main },
    { label: "Critical", value: breakdown.critical, color: theme.palette.error.dark },
  ];

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Severity Distribution
      </Typography>
      <Box
        sx={{
          display: "flex",
          height: 10,
          borderRadius: 5,
          overflow: "hidden",
          mb: 1.5,
        }}
      >
        {segments.map((seg) => (
          <Tooltip key={seg.label} title={`${seg.label}: ${seg.value} (${((seg.value / total) * 100).toFixed(1)}%)`}>
            <Box
              sx={{
                width: `${(seg.value / total) * 100}%`,
                bgcolor: seg.color,
                minWidth: seg.value > 0 ? 4 : 0,
                transition: "width 0.5s ease",
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {segments.map((seg) => (
          <Stack key={seg.label} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: seg.color }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {seg.label}: {seg.value.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

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
      <FavoriteIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Health Data Yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 440 }}>
        Upload your system logs to get an instant health assessment. We'll analyze error rates,
        detect anomalies, and give you actionable recommendations.
      </Typography>
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => setActiveView("upload")}
        size="large"
      >
        Upload Your First Logs
      </Button>
    </Box>
  );
}

// --- Main Component ---
export default function SystemHealth() {
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
      const result = await fetchHealthScore(token);
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
          <Typography component="h2" variant="h6">System Health</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Skeleton variant="circular" width={140} height={140} sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="60%" sx={{ mx: "auto", mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="rectangular" height={10} sx={{ my: 2, borderRadius: 5 }} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 1 }} />
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
          action={
            <Button color="inherit" size="small" onClick={loadData}>
              Retry
            </Button>
          }
        >
          Failed to load health data: {error}
        </Alert>
      </Box>
    );
  }

  if (!data || data.status === "no-data") {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          System Health
        </Typography>
        <Card variant="outlined">
          <NoDataState />
        </Card>
      </Box>
    );
  }

  const trendIcon =
    data.trendDirection === "improving" ? (
      <TrendingUpIcon sx={{ color: "success.main" }} />
    ) : data.trendDirection === "degrading" ? (
      <TrendingDownIcon sx={{ color: "error.main" }} />
    ) : (
      <TrendingFlatIcon sx={{ color: "text.secondary" }} />
    );

  const trendLabel =
    data.trendDirection === "improving"
      ? "Improving"
      : data.trendDirection === "degrading"
      ? "Degrading"
      : "Stable";

  const trendColor =
    data.trendDirection === "improving"
      ? "success"
      : data.trendDirection === "degrading"
      ? "error"
      : "default";

  // Prepare trend chart data
  const trendDates = data.trend
    .filter((t) => t.score >= 0)
    .map((t) => new Date(t.date));
  const trendScores = data.trend
    .filter((t) => t.score >= 0)
    .map((t) => t.score);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography component="h2" variant="h6">
          System Health
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadData} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2}>
        {/* Health Score Gauge */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <HealthGauge score={data.score} status={data.status} />
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                {trendIcon}
                <Chip label={trendLabel} color={trendColor} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  vs last week
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Severity Breakdown + 24h Snapshot */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <SeverityBreakdown breakdown={data.breakdown} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Last 24 Hours
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Total", value: data.last24h.total, icon: <InfoOutlinedIcon fontSize="small" /> },
                  { label: "Errors", value: data.last24h.error, icon: <ErrorOutlineIcon fontSize="small" color="error" /> },
                  { label: "Warnings", value: data.last24h.warning, icon: <WarningAmberIcon fontSize="small" color="warning" /> },
                  { label: "Critical", value: data.last24h.critical, icon: <ReportProblemIcon fontSize="small" color="error" /> },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {item.icon}
                      <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                          {item.value.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Trend Chart */}
        {trendDates.length > 2 && (
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Health Score Trend (30 days)
                </Typography>
                <Box sx={{ width: "100%", height: 220 }}>
                  <LineChart
                    xAxis={[
                      {
                        data: trendDates,
                        scaleType: "time",
                        tickLabelStyle: { fontSize: 11 },
                      },
                    ]}
                    yAxis={[{ min: 0, max: 100 }]}
                    series={[
                      {
                        data: trendScores,
                        label: "Health Score",
                        area: true,
                        showMark: false,
                        curve: "monotoneX",
                        color: theme.palette.primary.main,
                      },
                    ]}
                    height={220}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recommendations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Recommendations
              </Typography>
              <Stack spacing={1}>
                {data.recommendations.map((rec, i) => (
                  <Alert
                    key={i}
                    severity={
                      rec.toLowerCase().includes("critical") || rec.toLowerCase().includes("error rate")
                        ? "error"
                        : rec.toLowerCase().includes("improving") || rec.toLowerCase().includes("stable")
                        ? "success"
                        : rec.toLowerCase().includes("no logs")
                        ? "warning"
                        : "info"
                    }
                    variant="outlined"
                    sx={{ py: 0 }}
                  >
                    <Typography variant="body2">{rec}</Typography>
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Error Sources */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Top Error Sources
              </Typography>
              {data.topErrors.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No errors detected — your system is clean! 🎉
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {data.topErrors.map((err, i) => (
                    <Paper
                      key={i}
                      variant="outlined"
                      sx={{ p: 1.5, borderLeft: 3, borderLeftColor: err.severity === "CRITICAL" ? "error.main" : "warning.main" }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {err.message}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip label={err.severity} size="small" color={err.severity === "CRITICAL" ? "error" : "warning"} />
                            {err.logType && <Chip label={err.logType} size="small" variant="outlined" />}
                          </Stack>
                        </Box>
                        <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
                          {err.count}×
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
