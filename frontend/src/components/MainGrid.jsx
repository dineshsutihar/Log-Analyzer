import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogTypeStatus from "./LogTypeStatus";
import HighlightedCard from "./HighlightedCard";
import LogAnalyzedBarChart from "./LogAnalyzedBarGraph";
import StatCard from "./StatCard";
import fetchStats from "../utils/api/fetchStats";
import { fetchHealthScore } from "../utils/api/healthInsights";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";

function StatCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton
          variant="rectangular"
          height={50}
          sx={{ mt: 1, borderRadius: 1 }}
        />
      </CardContent>
    </Card>
  );
}

function HealthPreviewCard({ health, onNavigate }) {
  if (!health || health.status === "no-data") return null;

  const getColor = (score) => {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const getIcon = (score) => {
    if (score >= 75) return <CheckCircleOutlineIcon />;
    if (score >= 50) return <WarningAmberIcon />;
    return <ErrorOutlineIcon />;
  };

  const trendIcon =
    health.trendDirection === "improving" ? (
      <TrendingUpIcon fontSize="small" color="success" />
    ) : health.trendDirection === "degrading" ? (
      <TrendingDownIcon fontSize="small" color="error" />
    ) : (
      <TrendingFlatIcon fontSize="small" />
    );

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
      onClick={onNavigate}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <MonitorHeartIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2">System Health</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h3" fontWeight={700} color={`${getColor(health.score)}.main`}>
            {health.score}
          </Typography>
          <Box>
            <Chip
              icon={getIcon(health.score)}
              label={health.status.charAt(0).toUpperCase() + health.status.slice(1)}
              color={getColor(health.score)}
              size="small"
              variant="outlined"
            />
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
              {trendIcon}
              <Typography variant="caption" color="text.secondary">
                {health.trendDirection} vs last week
              </Typography>
            </Stack>
          </Box>
        </Stack>
        {health.recommendations?.[0] && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {health.recommendations[0]}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WelcomeState({ onUpload }) {
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
      <MonitorHeartIcon sx={{ fontSize: 72, color: "primary.main", mb: 2, opacity: 0.7 }} />
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Welcome to Log Analyzer
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 520 }}
      >
        Upload your system logs to get instant health scoring, automated pattern detection,
        anomaly alerts, and AI-powered analysis. We support Windows CSV and Linux log files.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CloudUploadIcon />}
          onClick={onUpload}
        >
          Upload Your First Logs
        </Button>
        <Tooltip title="See what insights look like">
          <Button variant="outlined" size="large" startIcon={<TroubleshootIcon />} disabled>
            View Sample Report
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default function MainGrid() {
  const [data, setData] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const { getToken } = useAuth();
  const [, setActiveView] = useRecoilState(activeViewState);
  const refreshTimerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [statsResponse, healthResponse] = await Promise.all([
        fetchStats(token),
        fetchHealthScore(token).catch(() => null),
      ]);
      setData(statsResponse);
      setHealth(healthResponse);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    refreshTimerRef.current = setInterval(fetchData, 5 * 60 * 1000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchData]);

  if (error) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard: {error}
        </Alert>
      </Box>
    );
  }

  // Show welcome state when no data and not loading
  const hasNoData =
    !loading &&
    data.length > 0 &&
    data.every((d) => d.value === 0) &&
    (!health || health.status === "no-data");

  if (!loading && hasNoData) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <WelcomeState onUpload={() => setActiveView("upload")} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography component="h2" variant="h6">
          Overview
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {lastRefreshed && (
            <Typography variant="caption" color="text.secondary">
              Updated {lastRefreshed.toLocaleTimeString()}
            </Typography>
          )}
          <Tooltip title="Refresh now">
            <IconButton size="small" onClick={fetchData} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {/* Health Score Preview Card */}
        {loading ? (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCardSkeleton />
          </Grid>
        ) : health && health.status !== "no-data" ? (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <HealthPreviewCard
              health={health}
              onNavigate={() => setActiveView("health")}
            />
          </Grid>
        ) : null}

        {/* Stat Cards */}
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCardSkeleton />
              </Grid>
            ))
          : data.map((card, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard {...card} />
              </Grid>
            ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <LogTypeStatus />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <LogAnalyzedBarChart />
        </Grid>
      </Grid>
    </Box>
  );
}
