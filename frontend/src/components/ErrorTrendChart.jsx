import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import severityInfo from "../utils/api/severityInfo";
import { useAuth } from "@clerk/clerk-react";

export default function ErrorTrendChart() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [months, setMonths] = React.useState([]);
  const [trend, setTrend] = React.useState(0);

  React.useEffect(() => {
    const getLastSevenMonths = () => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const result = [];
      const currentMonth = new Date().getMonth();
      for (let i = 6; i >= 0; i--) {
        result.push(monthNames[(currentMonth - i + 12) % 12]);
      }
      return result;
    };

    setMonths(getLastSevenMonths());

    const fetchData = async () => {
      try {
        const token = await getToken();
        const response = await severityInfo(token);

        const errorData = response.error || [0, 0, 0, 0, 0, 0, 0];
        const criticalData = response.critical || [0, 0, 0, 0, 0, 0, 0];
        const warningData = response.warning || [0, 0, 0, 0, 0, 0, 0];

        setData({ error: errorData, critical: criticalData, warning: warningData });

        // Compute trend
        const combinedLast = (errorData[errorData.length - 1] || 0) + (criticalData[criticalData.length - 1] || 0);
        const combinedPrev = (errorData[errorData.length - 2] || 0) + (criticalData[criticalData.length - 2] || 0);
        if (combinedPrev > 0) {
          setTrend(Math.round(((combinedLast - combinedPrev) / combinedPrev) * 100));
        }
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Error Trend
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="h4" component="p">
              {(data?.error || []).reduce((s, v) => s + v, 0) + (data?.critical || []).reduce((s, v) => s + v, 0)}
            </Typography>
            <Chip
              size="small"
              color={trend <= 0 ? "success" : "error"}
              label={`${trend >= 0 ? "+" : ""}${trend}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Errors & critical events over the last 7 months
          </Typography>
        </Stack>
        <Box sx={{ width: "100%", mt: 1 }}>
          <LineChart
            xAxis={[{ scaleType: "band", data: months }]}
            series={[
              {
                label: "Errors",
                data: data?.error || [],
                color: theme.palette.error.main,
                showMark: true,
                area: true,
              },
              {
                label: "Critical",
                data: data?.critical || [],
                color: theme.palette.error.dark,
                showMark: true,
              },
              {
                label: "Warnings",
                data: data?.warning || [],
                color: theme.palette.warning.main,
                showMark: false,
              },
            ]}
            height={220}
            margin={{ left: 50, right: 10, top: 20, bottom: 20 }}
            grid={{ horizontal: true }}
            slotProps={{ legend: { hidden: false } }}
            sx={{
              "& .MuiAreaElement-root": {
                fillOpacity: 0.15,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
