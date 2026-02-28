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
import LogTypeStatus from "./LogTypeStatus";
import HighlightedCard from "./HighlightedCard";
import LogAnalyzedBarChart from "./LogAnalyzedBarGraph";
import StatCard from "./StatCard";
import fetchStats from "../utils/api/fetchStats";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

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

export default function MainGrid() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetchStats(token);
      setData(response);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
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
