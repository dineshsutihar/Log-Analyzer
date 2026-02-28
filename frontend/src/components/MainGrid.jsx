import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogTypeStatus from "./LogTypeStatus";
import HighlightedCard from "./HighlightedCard";
import LogAnalyzedBarChart from "./LogAnalyzedBarGraph";
import SessionsChart from "./SessionsChart";
import StatCard from "./StatCard";
import fetchStats from "../utils/api/fetchStats";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function MainGrid() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const response = await fetchStats(token);
        setData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard: {error}</div>;
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
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
      {/* // TODO: add line Graph to show the trend of the logs over time */}
      {/* <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <SessionsChart />
          </Stack>
        </Grid>
      </Grid> */}
    </Box>
  );
}
